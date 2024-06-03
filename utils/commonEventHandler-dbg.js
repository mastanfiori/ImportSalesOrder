/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter",
	"sap/f/library",
	"sap/ui/unified/FileUploaderParameter",
	"sap/ui/core/Fragment",
	"sap/m/Link",
	"sap/m/Title",
	"sap/m/Label",
	"sap/ui/layout/HorizontalLayout"
], function (MessageBox, UploadCollectionParameter, fioriLibrary, FileUploaderParameter, Fragment, Link, Title, Label, HorizontalLayout) {
	"use strict";

	return {
		oController: {},

		//Event handler for UploadCollection&FileUploader event typeMissMatch
		onTypeMissMatch: function (oEvent) {
			MessageBox.error(this.oResourceBundle.getText("MSG_WRONG_FILE_TYPE"));
		},
		//Event handler for UploadCollection&FileUploader event fileSizeExceed
		onfileSizeExceed: function (oEvent) {
			MessageBox.error(this.oResourceBundle.getText("MSG_FILE_SIZE"));
		},

		//Event handler for UploadCollection event beforeUploadStarts
		onBeforeUploadStarts: function (oEvent) {
			if (!this.utility.isCorrectUpload(oEvent)) {
				//Deal with import
				var sUploadName = oEvent.getParameters().fileName;
				sUploadName = this.utility.processFileName(sUploadName);
				var id = "";
			} else {
				//Deal with reupload
				sUploadName = this.FileNameImport.getValue();
				id = this.oSalesDocImportID.getProperty("/SalesDocImportID");
			}
			var slug = id + " |" + sUploadName;
			this.oUIModel.setProperty("/uploadJobName", sUploadName);

			//Encode the SLUG value on client side and decode in the server side
			oEvent.getParameters().addHeaderParameter(new UploadCollectionParameter({
				name: "slug",
				value: encodeURIComponent(slug)
			}));

			oEvent.getParameters().addHeaderParameter(new UploadCollectionParameter({
				name: "X-CSRF-Token",
				value: this.oModel.getSecurityToken()
			}));
			var oView = this.getView();
			oView.setBusy(true);
		},

		// File uploader change event
		handleFileChange: function (oEvent) {
			if (!this.Uploader.getValue()) {
				// MessageToast.show("Choose a file first");
				return;
			}

			if (!this.utility.isCorrectUpload(oEvent)) {
				//Deal with import
				var sUploadName = oEvent.getParameters().files[0].name;
				sUploadName = this.utility.processFileName(sUploadName);
				var id = "";
			} else {
				//Deal with reupload
				sUploadName = this.FileNameImport.getValue();
				id = this.oSalesDocImportID.getProperty("/SalesDocImportID");
			}
			this.oUIModel.setProperty("/uploadJobName", sUploadName);

			var slug = id + " |" + sUploadName;
			this.Uploader.destroyHeaderParameters();
			//Encode the SLUG value on client side and decode in the server side
			this.Uploader.addHeaderParameter(new FileUploaderParameter({
				name: "slug",
				value: encodeURIComponent(slug)
			}));

			this.Uploader.addHeaderParameter(new FileUploaderParameter({
				name: "X-CSRF-Token",
				value: this.oModel.getSecurityToken()
			}));

			this.Uploader.setSendXHR(true);
			this.Uploader.upload();
			var oView = this.getView();
			oView.setBusy(true);
		},

		handleUploadComplete: function (oEvent) {
			if (oEvent.getParameter("id").indexOf("reupload") !== -1) {
				var bReupload = true;
			} else {
				bReupload = false;
			}
			var oTriggerObject = oEvent.getSource();
			var oResponse;
			//var oView = this.getView();
			//Prepare oRespose object accroding to Trigger Object
			if (oTriggerObject instanceof sap.m.UploadCollection) {
				oResponse = oEvent.getParameters();
			} else if (oTriggerObject instanceof sap.ui.unified.FileUploader) {
				oResponse = oEvent;
				this.Uploader.setSendXHR(false);
			} else {
				this.oPreviewView.setBusy(false);
				return;
			}
			//New file upload comple, the page should back to Master Page
			if (!this.utility.isCorrectUpload(oEvent)) {
				//Deal with import
				this.backToMasterPage();
			} else {
				//Deal with reupload
			}

			//Prepare error message text
			var sGeneralErrorMessage = this.oResourceBundle.getText("MSG_NO_DATA_RETURN");

			var sTechErrorMsg = this.oResourceBundle.getText("MSG_ERROR_OCCUR");

			var response = jQuery.parseXML(oResponse.getParameters().responseRaw);
			//Error1, no valid response data returnned
			if (response === "" || response === undefined || response === null) {
				this.oPreviewView.setBusy(false);
				MessageBox.error(sGeneralErrorMessage);
				return;
			}

			//Error2 Backend return general error message 
			var aErrorNode = response.querySelectorAll("error");
			if (aErrorNode.length > 0) {
				//only return first message
				//Usually only one error will be return from backend
				var aMessageNode = aErrorNode[0].getElementsByTagName("message");
				var sErrorMessage;
				if (aMessageNode && aMessageNode.length > 0) {
					sErrorMessage = aMessageNode[0].textContent ? aMessageNode[0].textContent : sTechErrorMsg;
				} else {
					sErrorMessage = sTechErrorMsg;
				}
				MessageBox.error(sErrorMessage);
				this.oPreviewView.setBusy(false);
				return;
			}

			//Error3, Upload status error, cannot parse the file
			var aUploadStatus = response.querySelectorAll("UploadStatus");
			var aMessageDetails = response.querySelectorAll("DetailMessage");
			if (aUploadStatus.length <= 0 || aMessageDetails.length <= 0) {
				//no valid data returns
				return;
			}

			var sDetailMessage = response.querySelectorAll("DetailMessage")[0].textContent;
			try {
				var aMessages = JSON.parse(sDetailMessage).MESSAGES;
			} catch (err) {
				aMessages = [];
			}
			var sUploadStatus = response.querySelectorAll("UploadStatus")[0].textContent;
			var aGeneralStatus = ["Error", "TechFLDError", "FileSizeError", "ReuploadError"];
			if (aGeneralStatus.indexOf(sUploadStatus) !== -1) {
				this.oPreviewView.setBusy(false);
				if (aMessages.length === 0) {
					MessageBox.error(sGeneralErrorMessage);
				} else {
					var sMessageDetails = "";
					for (var i in aMessages) {
						sMessageDetails = (sMessageDetails === "") ? aMessages[i].TITLE : sMessageDetails + "<br>" + aMessages[i].TITLE;
					}
					if (sUploadStatus === "TechFLDError") {
						MessageBox.error(sGeneralErrorMessage, {
							details: sMessageDetails
						});
					} else if (sUploadStatus === "FileSizeError" || sUploadStatus === "ReuploadError") {
						MessageBox.error(sMessageDetails);
					}
				}
				return;
			}
			if(response.querySelectorAll("DuplicateImports")[0]){
				this.bHasDuplicateImports = response.querySelectorAll("DuplicateImports")[0].textContent.length !== 0;
			}
			if(response.querySelectorAll("SalesDocFileHash")[0]){
				this.SlsDocImprtdFileContentHash = response.querySelectorAll("SalesDocFileHash")[0].textContent;
			}else{
				this.SlsDocImprtdFileContentHash = "";
			}
			this.response = response;
			this.bReupload = bReupload;
			if (this.bHasDuplicateImports && !this.bReupload) {
				//Only work for import and has duplicate imports
				this.commonEventHandler._dealWithDuplicate.call(this);
			} else {
				this.commonEventHandler._dealWithReturnData.call(this);
			}
		},

		_dealWithDuplicate: function (param) {
			var sDuplicateImports = this.response.querySelectorAll("DuplicateImports")[0].textContent;
			var oView = this.getView();
			try {
				this.oDuplicateImports = JSON.parse(sDuplicateImports);
			} catch (err) {
				return;
			}

			if (!this._pDuplicatePopover) {
				this._pDuplicatePopover = Fragment.load({
					id: "duplicateItemsPopoverID",
					name: "cus.sd.salesorder.imports1.view.fragment.DuplicateImports",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this._pDuplicatePopover.then(function (oPopover) {
				oPopover.open();
			});
		},

		_dealWithReturnData: function (param) {
			var aReturnData = this.response.querySelectorAll("UploadContent");
			var aFieldList = this.response.querySelectorAll("UploadFields");
			var sDetailMessage = this.response.querySelectorAll("DetailMessage")[0].textContent;
			var sGeneralErrorMessage = this.oResourceBundle.getText("MSG_NO_DATA_RETURN");
			this.utility.processFieldList(aFieldList);
			this.utility.splitFieldList(aFieldList);
			var sNoSalesOrderReturn = this.oResourceBundle.getText("MSG_NO_SALES_ORDER");

			if (aReturnData && aReturnData.length > 0) {
				var uploadDataJSON = aReturnData[0].textContent;
				try {
					var oUploadData = JSON.parse(uploadDataJSON);
				} catch (err) {
					this.oPreviewView.setBusy(false);
					MessageBox.error(sNoSalesOrderReturn);
					return;
				}
				if (oUploadData !== undefined && oUploadData !== null && oUploadData !== "") {
					if (oUploadData.to_ImportHistItem !== undefined) {
						this.utility.parseMessageContent(sDetailMessage);
						this.utility.processReturnData(oUploadData, this.bReupload);
					}
				} else {
					MessageBox.error(sNoSalesOrderReturn);
				}
			} else {
				MessageBox.error(sGeneralErrorMessage);
			}
			this.oPreviewView.setBusy(false);
		},

		onShowDetailsInDuplicate: function (oEvent) {
			var oDuplicateContentArea = oEvent.getSource().getParent();
			var aDuplicationImports = this.oDuplicateImports.UPLOADFIELDS;
			oEvent.getSource().destroy();
			for (var itemIndex in aDuplicationImports) {
				if (aDuplicationImports[itemIndex].SALESDOCUMENTIMPORTID) {
					oDuplicateContentArea.addContent(
						new Link({
							text: "∙ " + aDuplicationImports[itemIndex].SALESDOCUMENTIMPORTNAME
						}).setEmphasized(true).attachPress(this.commonEventHandler._navigateToHistoryDetail.bind(this, aDuplicationImports[itemIndex].SALESDOCUMENTIMPORTID))
					);
				} else {
					oDuplicateContentArea.addContent(
						new Title({
							text: "∙ " + aDuplicationImports[itemIndex].SALESDOCUMENTIMPORTNAME,
							titleStyle: "H6"
						}).addStyleClass("myCustomText")
					);
				}
				var sLabelInfo1 = "Imported By: " + aDuplicationImports[itemIndex].CREATEDBYUSERNAME + " (" + aDuplicationImports[itemIndex].CREATEDBYUSER + ")";
				var sLabelInfo2 = "Imported On: " + this.commonEventHandler._parseTimestamp(aDuplicationImports[itemIndex].SALESDOCUMENTIMPORTDATETIME);
				var sLabelInfo = sLabelInfo1 + " · " + sLabelInfo2;
				oDuplicateContentArea.addContent(
					new Label({
						text: sLabelInfo
					}).addStyleClass("sapUiSmallMarginBottom sapUiTinyMarginBegin")
				);
			}
		},

		_parseTimestamp: function (param) {
			var stimeStamp = String(param);
			var sdate = stimeStamp.substring(4, 6) + "/" + stimeStamp.substring(6, 8) + "/" + stimeStamp.substring(0, 4);
			var stime = stimeStamp.substring(8, 10) + ":" + stimeStamp.substring(10, 12) + ":" + stimeStamp.substring(12, 14);
			return sdate + ", " + stime;
		},

		_navigateToHistoryDetail: function (sImportID) {
			this.bNavigateFromDuplicateDilog = true;
			this.sImportName = this.oUIModel.getProperty("/uploadJobName");
			var sEntity = this.sHistoryEntity + "('" + sImportID + "')";
			this.commonEventHandler._destoryDuplicateItemsDialog.call(this);
			this.oRouter.navTo("ImportHistoryDetail", {
				layout: fioriLibrary.LayoutType.OneColumn,
				entity: sEntity
			});
		},

		onUploadWithDuplicate: function () {
			if(this.bNavigateFromDuplicateDilog){
				this.bNavigateFromDuplicateDilog = false;
				this.sImportName = null;
			}
			this.commonEventHandler._destoryDuplicateItemsDialog.call(this);
			this.commonEventHandler._dealWithReturnData.call(this);
		},

		_destoryDuplicateItemsDialog: function () {
			var that = this;
			this._pDuplicatePopover.then(function (oPopover) {
				oPopover.destroy();
				that._pDuplicatePopover = null;
			});
		},

		onCancelUploadSinceDuplicate: function () {
			if(this.bNavigateFromDuplicateDilog){
				this.bNavigateFromDuplicateDilog = false;
				this.sImportName = null;
			}
			this.commonEventHandler._destoryDuplicateItemsDialog.call(this);
			this.oPreviewView.setBusy(false);
		},

		onListItemPress: function (oEvent) {
			if (!this.utility.isCorrectUpload(oEvent)) {
				var oBindingObject = oEvent.getSource().getBindingContext("importSalesOrder").getObject();
			} else {
				oBindingObject = oEvent.getSource().getBindingContext("reuploadSalesDoc").getObject();
			}

			var sKeyFiled = "SalesDocumentTemporaryID";
			var sSalesOrder = oBindingObject[sKeyFiled];
			var aSalesData = this.oImportDataModel.getProperty("/salesHeaderData");
			this.oUIModel.setProperty("/Title", sSalesOrder);

			function findItem(oSo) {
				return oSo[sKeyFiled] === sSalesOrder;
			}

			var aItem = aSalesData.filter(findItem);

			sSalesOrder = sSalesOrder === "" ? " " : sSalesOrder;

			this.oImportDataModel.setProperty("/salesItemData", aItem[0].to_Item);
			this.oUIModel.setProperty("/actionButtonsInfo", 1);
			this.oUIModel.setProperty("/fieldList", this.oFiledList);

			if (!this.utility.isCorrectUpload(oEvent)) {
				this.oRouter.navTo("detail", {
						layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded
					},
					true);
			} else {
				this.oReuploaderNavContainer.to(this.oReuploaderNavContainer.getPages()[1].getId());
			}
		},

		onHandleShowHideDetail: function (oEvent) {
			var aHiddenInPopin = this.oPreviewTable.getHiddenInPopin();
			if (aHiddenInPopin && aHiddenInPopin.length === 1) {
				//Currencly on hide detail mode, swtich to show detail mode
				this.utility.showTableDetail();
			} else {
				//Currencly on show detail mode, swtich to hide detail mode
				this.utility.hideTableDetail();
			}
		},

		onPopinChanged: function (oEvent) {
			var oTablePopinStatus = oEvent.getParameters();
			if (oTablePopinStatus && oTablePopinStatus.hasOwnProperty("hasPopin") && oTablePopinStatus.hasOwnProperty("hiddenInPopin")) {
				if (!oTablePopinStatus.hasPopin && oTablePopinStatus.hiddenInPopin.length === 0) {
					//no column need to hide in popin area 
					this.oDetailButton.setVisible(false);
				} else {
					this.oDetailButton.setVisible(true);
				}
			} else {
				//Some case(initial phase) no Property "hasPopin" means no column hide 
				this.oDetailButton.setVisible(false);
			}
		},

		handleTextCloseButton: function () {
			var that = this;
			this._pTextPopover.then(function (oPopover) {
				oPopover.destroy();
				that._pTextPopover = null;
			});
		}
	};

});