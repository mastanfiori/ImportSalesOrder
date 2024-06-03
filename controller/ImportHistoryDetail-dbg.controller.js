/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/generic/app/navigation/service/NavigationHandler",
	"cus/sd/salesorder/imports1/utils/formatter",
	"sap/f/library",
	"sap/ui/core/library",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/core/MessageType",
	"sap/m/MessageStrip",
	"sap/m/Link",
	"sap/ui/model/odata/v2/ODataModel",
	"cus/sd/salesorder/imports1/utils/utility",
	"cus/sd/salesorder/imports1/utils/commonEventHandler",
	"sap/ui/core/Item",
	"cus/sd/salesorder/imports1/utils/CONSTANTS",
	"cus/sd/salesorder/imports1/utils/customUIFactory"
], function (Controller, FilterOperator, Filter, NavigationHandler, formatter, library, CoreLibrary, InvisibleMessage, Fragment,
	MessageBox, MessageType, MessageStrip, Link, ODataModel, utility, commonEventHandler, Item, CNSTS, customUIFactory) {
	"use strict";
	var InvisibleMessageMode = CoreLibrary.InvisibleMessageMode;
	return Controller.extend("cus.sd.salesorder.imports1.controller.ImportHistoryDetail", {

		formatter: formatter,
		customUIFactory: customUIFactory,
		commonEventHandler: commonEventHandler,

		oSetAsCompletedModel: new ODataModel(CNSTS.SET_AS_COMPLETED_MODEL_URL),

		sUploadName: "",
		sMessageStripinDetailHistoryPage: "sMessageStripinDetailHistoryPage",
		oFiledList: {},
		//Save uploaded field label(SAP label + Excel label)
		oUploadedFiledList: [],
		oP13nColumns: {
			headerColumns: [],
			itemColumns: [],
			headerRuntimeColumns: [],
			itemRuntimeColumns: []
		},
		oPartnerFunctions: {
			WE: "ShipToParty",
			RE: "BillToParty",
			RG: "PayerParty",
			VE: "SalesEmployee",
			ZM: "ResponsibleEmployee"
		},
		oItemPartnerFunctions: {
			AG: "SoldToParty",
			WE: "ShipToParty",
			RE: "BillToParty",
			RG: "PayerParty",
			VE: "SalesEmployee",
			ZM: "ResponsibleEmployee"
		},

		// initilized: false,
		onInit: function (oController) {
			//this.initialModels();
			this.oModel = this.getOwnerComponent().getModel();
			this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oSalesDocImportID = this.getOwnerComponent().getModel("reuploadSlsDocImprtID");
			this.oReuploadDataModel = this.getOwnerComponent().getModel("reuploadData");
			this.oUIModel = this.getOwnerComponent().getModel("reuploadUi");
			this.oSearchfield = this.byId("searchItems");
			this.oSmartTable = this.byId("importHistoryItemSmartTable");
			this.oRefreshBtn = this.byId("btn-refresh");
			var oDocModel = this.getOwnerComponent().getModel("document");
			this.sHistoryEntity = oDocModel.getProperty("/historyEntity");
			this.sHistoryItemEntity = oDocModel.getProperty("/historyItemEntity");
			this.oSmartTable.setEntitySet(this.sHistoryItemEntity);
			this.utility = new utility(this, "Header");
			//Initialize Route
			this.oRouter = this.getOwnerComponent().getRouter("ImportHistoryDetail");
			this.oRouter.getRoute("ImportHistoryDetail").attachPatternMatched(this.onRoutePatternMatched, this);

			this.oInvisibleMessage = InvisibleMessage.getInstance();
			this.oModel.attachRequestCompleted(this._onModelRequestCompleted.bind(this));

			this.onInitLogComponent();
			this.bOnInitFinished = true;
			this.setObjectPageIcon();

			this._toggleSetAsCompletedUI();
		},

		/** this method will only be called by application varaint app
		 * through "document" model to set oDataService related value
		 * which will be consumed in controller
		 **/
		setDocumentModel: function (oModelInfo) {
			var oDocModel = this.getOwnerComponent().getModel("document");
			if (oModelInfo) {
				if (!(oDocModel.getProperty("/bReplaced"))) {
					oDocModel.setProperty("/modelName", oModelInfo.modelName);
					oDocModel.setProperty("/keyField", oModelInfo.keyField);
					oDocModel.setProperty("/keyItemField", oModelInfo.keyItemField);
					oDocModel.setProperty("/importFieldEntity", oModelInfo.importFieldEntity);
					oDocModel.setProperty("/importItemFieldEntity", oModelInfo.importItemFieldEntity);
					oDocModel.setProperty("/importPrincingFieldEntity", oModelInfo.importPrincingFieldEntity);
					oDocModel.setProperty("/importEntity", oModelInfo.importEntity);
					oDocModel.setProperty("/historyEntity", oModelInfo.historyEntity);
					oDocModel.setProperty("/historyItemEntity", oModelInfo.historyItemEntity);
					oDocModel.setProperty("/bReplaced", true);
				}
			}

			this.sHistoryEntity = oDocModel.getProperty("/historyEntity");
			this.sHistoryItemEntity = oDocModel.getProperty("/historyItemEntity");
			this.oSmartTable.setEntitySet(this.sHistoryItemEntity);
			var sHistoryItemEntity = oDocModel.getProperty("/historyItemEntity");
			this.oSmartTable.setEntitySet(sHistoryItemEntity);
			this.setObjectPageIcon();
		},

		setObjectPageIcon: function () {
			var oDocModel = this.getOwnerComponent().getModel("document");
			var sKeyField = oDocModel.getProperty("/keyField");
			if (sKeyField === "SalesQuotation") {
				//Change Object Page Header Icon
				this.byId("Picture").setSrc("sap-icon://sales-quote");
			}

		},

		_onModelRequestCompleted: function (oEvent) {
			//The preview request in reupload dialog will also into the method with an id.
			if (oEvent.id === undefined || oEvent.id.indexOf("reupload") === -1) {
				var oParameters = oEvent.getParameters();
				switch (oParameters.method) {
				case "POST":
					return;
				case "GET":
					if (oParameters.url.indexOf(this.sHistoryEntity + "(") >= 0) {
						// if it's header 
						this.checkCreationStatus(oEvent, "H");
					} else if (oParameters.url.indexOf(this.sHistoryItemEntity + "(") >= 0 && oParameters.url.indexOf("count") < 0) {
						// if it's item, 
						// this.checkCreationStatus(oEvent, "I");
						// Now, we just check process status in header
					}
					return;
				default:
					return;
				}
			} else {

			}
		},

		checkCreationStatus: function (oEvent, type) {
			// to verify whether the creation is failed or not, if some of the order is failed to create,
			// we will display the message strip
			var sType = MessageType.Error;
			var sText = this.oResourceBundle.getText("CORRECTION_ERROR");

			// check creation status, if failed, display message box
			var oParameters = oEvent.getParameters();
			var sShowMessageStrip = false;
			if (type === "H") {
				//distroy message strip
				this.distroyMessageBox(this.sMessageStripinDetailHistoryPage);

				var sProcessStatus = JSON.parse(oParameters.response.responseText).d.SlsDocImprtProcessingStatus;
				// var sImportStatus = JSON.parse(oParameters.response.responseText).d.SalesDocumentImportStatus;
				// 1 - Contains Errors
				if (sProcessStatus && (sProcessStatus === "1")) {
					if (!this.byId(this.sMessageStripinDetailHistoryPage)) {
						this._generateMsgStrip(sType, sText);
					}
					this.processStatusEmpty = false;
				} else {
					this.processStatusEmpty = true;
				}

			} else if (type === "I" && this.processStatusEmpty === true) {

				//distroy message strip
				this.distroyMessageBox(this.sMessageStripinDetailHistoryPage);

				//check whether the process status in header is empty or not. If yes, need to check the item data
				if (JSON.parse(oParameters.response.responseText).d.results) {
					var aItems = JSON.parse(oParameters.response.responseText).d.results;
					if (aItems && aItems.length > 0) {
						for (var itemIndex in aItems) {
							if (aItems[itemIndex].SalesDocumentCreationStatus === "3") {
								// if some orders are created failed, here we need to show the message strip to allow user upload again
								sShowMessageStrip = true;
								break;
							}
						}
					}
				}
			}
		},

		distroyMessageBox: function (sMessageStripID) {
			if (sMessageStripID) {
				var oMs = sap.ui.getCore().byId(sMessageStripID);
				if (oMs) {
					oMs.destroy();
				}
			}
		},

		_generateMsgStrip: function (sType, sText) {
			var oVC = this.byId("HITableLayout");
			this.bMessageStripStatus = sType;
			var oMsgStrip = new MessageStrip(this.sMessageStripinDetailHistoryPage, {
				text: sText,
				showCloseButton: false,
				showIcon: true,
				type: sType
			});
			if (sType !== MessageType.Success) {
				oMsgStrip.setLink(new Link({
					text: this.oResourceBundle.getText("MSG_REUPLOAD_LINK")
				}).attachPress(this.onReuploadClick, this));
			}
			var sTypeText = "";

			switch (sType) {
			case MessageType.Information:
				sTypeText = this.oResourceBundle.getText("INFORMATION");
				break;
			case MessageType.Success:
				sTypeText = this.oResourceBundle.getText("SUCCESS");
				break;
			case MessageType.Warning:
				sTypeText = this.oResourceBundle.getText("WARNING");
				break;
			case MessageType.Error:
				sTypeText = this.oResourceBundle.getText("ERROR");
				break;
			default:
				sTypeText = "";
			}

			this.oInvisibleMessage.announce(sTypeText + " " + sText, InvisibleMessageMode.Assertive);
			oVC.insertContent(oMsgStrip, 0);
		},

		onReuploadClick: function () {
			var oView = this.getView();
			var that = this;
			if (!this.reuploadDialog) {
				this.reuploadDialog = Fragment.load({
					id: oView.getId(),
					name: "cus.sd.salesorder.imports1.view.fragment.ReuploadDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this.reuploadDialog.then(function (oDialog) {
				oDialog.open();
				if (!that.reuploadNavBackButton) {
					var sPath = that.getView().getBindingContext().getPath();
					var sFileName = that.oModel.getObject(sPath).SalesDocumentImportName;
					that.reuploadView = that.byId("reuploadView");
					that.reuploadButton = that.byId("reuploadButton");
					that.reuploadNavBackButton = that.byId("reuploaderNavBack");
					that.oReuploaderNavContainer = that.byId("reuploadNavContainer");
					that.reupoadDialogTitle = that.byId("reuploadDialogTitle");
					that.reuploadNavBackButton.setVisible(false);
				}
			});
		},

		onCloseReuploaderDialog: function (oEvent) {
			var that = this;
			this.reuploadDialog.then(function (oDialog) {
				oDialog.destroy();
				that.reuploadDialog = null;
				that.reuploadNavBackButton = null;
			});
		},

		onNavBackToReuploadHeaderView: function () {
			this.reuploadNavBackButton.setVisible(false);
			this.reupoadDialogTitle.setText(this.oResourceBundle.getText("REUPLOAD_DIALOG_HEADER_TITLE"));
			this.oReuploaderNavContainer.back();
		},

		onInitLogComponent: function () {
			this.sLogID = this.utility.processNameByDate("appLogFragment");
			if (!this._oAppLogDialog) {
				this._oAppLogDialog = sap.ui.xmlfragment(this.sLogID, "cus.sd.salesorder.imports1.view.fragment.ApplicationLog",
					this);
				this.getView().addDependent(this._oAppLogDialog);
			}
			var sLogDataServiceUrl = "/sap/opu/odata/sap/APL_LOG_MANAGEMENT_SRV/";
			if (!this.oComp) {
				this.oComp = sap.ui.getCore().createComponent({
					name: "sap.nw.core.applogs.lib.reuse.applogs",
					id: this.createId("LogMessagesControlComponent"),
					settings: {
						"persistencyKey": "ImportLogDetail",
						"showHeader": false,
						"showFilterBar": false,
						"logDataServiceUrl": sLogDataServiceUrl
					}
				});
				var oLogContainter = sap.ui.core.Fragment.byId(this.sLogID, "LogMessagesControlContainer");
				oLogContainter.setComponent(this.oComp);
			}
		},
		/*------------------------------------------------------------------*/
		// Action handler
		/*------------------------------------------------------------------*/
		/*Data process for each navigation  */
		onRoutePatternMatched: function (oEvent) {
			if (oEvent.getParameter("name") === "ImportHistoryDetail") {
				var sEntityPath = oEvent.getParameter("arguments").entity;
				// it's possible that the Import ID contains special charators, the router will automatically convert it
				// therefore, here we need to decode it
				sEntityPath = decodeURI(sEntityPath);
				this.sEntityPath = sEntityPath;
				// get the import technical ID
				var pattern = /(?<=')[^']*/g;
				// var aImportID = sEntityPath.match(/('(\w+^\{))/g);
				var aImportID = sEntityPath.match(pattern);
				if (aImportID) {
					this.oSalesDocImportID.setProperty("/SalesDocImportID", aImportID[0]);
					this.SalesDocumentImportID = aImportID[0];
				} else {
					this.oSalesDocImportID.setProperty("/SalesDocImportID", "");
					this.SalesDocumentImportID = "";
				}

				if (this.reuploadDialog) {
					var that = this;
					this.reuploadDialog.then(function (oDialog) {
						oDialog.destroy();
						that.reuploadDialog = null;
						that.reuploadNavBackButton = null;
					});
				}

				//bind path
				this.getView().bindElement({
					path: "/" + sEntityPath
				});
				//rebind order table
				if (this.initialized === true) {
					// this.byId("importHistoryItemSmartTable").rebindTable();
					this.onRefreshClick(oEvent);
				} else {
					this.getView().getObjectBinding().refresh();
					this.initialized = true;
				}
			}
			//Store Placeholder Container
			if (!this.oPlaceholderContainer) {
				// remember navigation container and hide placeholder later once app is ready 
				// (e.g. data loaded or header loaded, etc.)
				this.oPlaceholderContainer = oEvent.getParameter("targetControl");
			}
		},

		/* Before rebind Import Sales Order Item table*/
		onBeforeRebindTable: function (oEvent) {
			var oBindingParams = oEvent.getParameter("bindingParams");

			// set filter
			var oFilter = oBindingParams.filters;
			oFilter.push(new Filter("SalesDocumentImportID", FilterOperator.EQ, this.SalesDocumentImportID));

			//check search field
			//var oSearchfield = this.byId("searchItems");
			if (this.oSearchfield) {
				var sSearchString = this.oSearchfield.getValue();
				if (!oBindingParams.parameters.custom) {
					oBindingParams.parameters.custom = {};
				}
				oBindingParams.parameters.custom.search = sSearchString;
			}
			// set default sort order
			if (oBindingParams.sorter === undefined || oBindingParams.sorter.length === 0) {
				oBindingParams.sorter = [new sap.ui.model.Sorter("SalesDocumentTemporaryID", false)];
			}

			// The placeholder should be hidden after the last data request.
			oEvent.getParameter("bindingParams").events.dataReceived = function () {
				if (this.oPlaceholderContainer) {
					this.oPlaceholderContainer.hidePlaceholder({
						aggregation: 'beginColumnPages'
					});
				}
				this.byId(CNSTS.IMPORT_HISTORY_ITEM_INNER_TABLE_ID).fireSelectionChange();
			}.bind(this);
			//this.addBindingListener(oBindingParams, "dataReceived", this._onBindingDataReceivedListener.bind(this));
		},

		onRefreshClick: function (oEvent) {
			this.getView().getObjectBinding().refresh();
			this.oSmartTable.rebindTable();
			this.onItemInnerTableSelectionChange();
		},

		onSearchItems: function (oEvent) {
			//trigger item refresh
			this.oSmartTable.rebindTable();
		},

		onBackToHisotry: function (oEvent) {
			this.oRouter.navTo("history", {
				layout: library.LayoutType.OneColumn
			});
		},

		onSmartLinkNavigate: function (oEvent) {
			this.storeCurrentAppState();
		},

		onLogCloseBtnPressed: function (oEvent) {
			oEvent.getSource().getParent().close();
		},

		onLogIconPressed: function (oEvent) {
			this.sLogID = this.utility.processNameByDate("appLogFragment");
			if (!this._oAppLogDialog) {
				this._oAppLogDialog = sap.ui.xmlfragment(this.sLogID, "cus.sd.salesorder.imports1.view.fragment.ApplicationLog",
					this);
				this.getView().addDependent(this._oAppLogDialog);
			}

			var that = this;

			var sLogDataServiceUrl = "/sap/opu/odata/sap/APL_LOG_MANAGEMENT_SRV/";
			if (!this.oComp) {
				this.oComp = sap.ui.getCore().createComponent({
					name: "sap.nw.core.applogs.lib.reuse.applogs",
					id: this.createId("LogMessagesControlComponent"),
					settings: {
						"persistencyKey": "ImportLogDetail",
						"showHeader": false,
						"showFilterBar": false,
						"logDataServiceUrl": sLogDataServiceUrl
					}
				});
				var oLogContainter = sap.ui.core.Fragment.byId(this.sLogID, "LogMessagesControlContainer");
				oLogContainter.setComponent(this.oComp);

			}

			//Get log handle
			var oSource = oEvent.getSource();
			var oParent = oSource.getParent();
			var sPath = oParent.getBindingContext().getPath();

			var loghandle = that.oModel.getObject(sPath).ApplicationLogHandle;
			this.oComp.setLogHandle(loghandle);
			this.oComp.refresh();

			this._oAppLogDialog.open();
		},

		onExit: function (oEvent) {
			this.oRouter.getRoute("ImportHistoryDetail").detachPatternMatched(this.onRoutePatternMatched, this);
			this._oAppLogDialog.destroy();
			var that = this;
			if (this.reuploadDialog) {
				this.reuploadDialog.then(function (oDialog) {
					oDialog.destroy();
					that.reuploadDialog = null;
					that.reuploadNavBackButton = null;
				});
			}
		},

		onImport: function (oEvent) {
			this.reuploadButton.setEnabled(false);
			var oModel = this.getOwnerComponent().getModel();
			var oNewEntry = {};
			var sImportName = this.oUIModel.getProperty("/uploadJobName");
			sImportName = typeof (sImportName) === "string" ? sImportName.trim() : sImportName;
			//Prepare New Object to Create
			oNewEntry.SalesDocumentImportName = sImportName;
			oNewEntry.SalesDocumentImportID = this.oSalesDocImportID.getProperty("/SalesDocImportID");
			this.oUploadData = this.oReuploadDataModel.getProperty("/reuploadData");
			oNewEntry.to_ImportHistItem = this.oUploadData.to_ImportHistItem;

			var oDocModel = this.getOwnerComponent().getModel("document");
			var sImportPath = oDocModel.getProperty("/importEntity");
			oModel.create(sImportPath, oNewEntry, {
				success: this.handleImportSuccess.bind(this),
				error: this.handleImportError.bind(this)
			});
			var that = this;
			this.reuploadDialog.then(function (oDialog) {
				oDialog.destroy();
				that.reuploadDialog = null;
				that.reuploadNavBackButton = null;
			});
			this.getView().setBusy(true);
		},

		handleImportSuccess: function (oSuccess, oResponse) {
			//var oView = this.getView();
			this.getView().setBusy(false);
			MessageBox.information(this.oResourceBundle.getText("REUPLOAD_SUCCESS_MESSAGE"));
			this.onRefreshClick();
		},

		handleImportError: function (oError) {
			//var oView = this.getView();
			this.getView().setBusy(false);
			var sErrorMessage = this.oResourceBundle.getText("MSG_ERROR_OCCUR");
			try {
				var oErrorMessage = JSON.parse(oError.responseText);
			} catch (err) {
				MessageBox.error(sErrorMessage);
				return;
			}
			if (oErrorMessage.error && oErrorMessage.error.message && oErrorMessage.error.message.value) {
				MessageBox.error(sErrorMessage, {
					details: oErrorMessage.error.message.value
				});
			} else {
				MessageBox.error(sErrorMessage);
			}
		},

		onItemInnerTableSelectionChange: function () {
			var aReturn = this._getShouldUpdateListItems();
			var bIsManuallyCompletedButtonEnabled = aReturn.aShouldUpdateListItems.length === 0 ? false : true;
			this.byId(CNSTS.IMPORT_HISTORY_ITEM_SET_AS_COMPLETED_BUTTON_ID).setEnabled(bIsManuallyCompletedButtonEnabled);
		},

		onPressSetAsCompleted: function (oEvent) {
			var _oI18n = this.getView().getModel("i18n").getResourceBundle();
			if (!this._oConfirmManuallyCompletedDialog) {
				this._oConfirmManuallyCompletedDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: _oI18n.getText("MNLLY_CMPLTD_CONFM_DIALOG_TITLE"),
					state: sap.ui.core.ValueState.Information,
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: _oI18n.getText("BUTTON_CONFIRM"),
						press: function () {
							this._sendRequestToSetAsCompleted.call(this);
							this._oConfirmManuallyCompletedDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						type: sap.m.ButtonType.Transparent,
						text: _oI18n.getText("BUTTON_CANCEL"),
						press: function () {
							this._oConfirmManuallyCompletedDialog.close();
						}.bind(this)
					})
				});
			}
			var sReturn = this._getShouldUpdateListItems();
			this._oConfirmManuallyCompletedDialog.destroyContent();
			if (sReturn.aShouldUpdateListItems.length > 1) {
				// Multiple select
				if (sReturn.allValid === true) {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ALL_VALID_ITEM", [sReturn.aShouldUpdateListItems.length])
					}));
				} else {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_DIALOG_MESSAGE_ITEM", [sReturn.aShouldUpdateListItems.length])
					}));
				}
			} else if (sReturn.aShouldUpdateListItems.length === 1) {
				if (sReturn.allValid === true) {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ONE_SEL_ITEM", [sReturn.aShouldUpdateListItems.length])
					}));
				} else {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ONE_VALID_ITEM", [sReturn.aShouldUpdateListItems.length])
					}));
				}
			} else {
				return;
			}
			this._oConfirmManuallyCompletedDialog.open();
		},

		_sendRequestToSetAsCompleted: function () {
			var sReturn = this._getShouldUpdateListItems();
			var aSelected = sReturn.aShouldUpdateListItems;
			if (aSelected && aSelected.length > 0) {
				var oModel = this.getView().getModel();
				oModel.setDeferredGroups(["batchFunctionImport"]);
				this.byId(CNSTS.IMPORT_HISTORY_ITEM_INNER_TABLE_ID).setBusy(true);
				for (var i = 0; i < aSelected.length; i++) {
					var sSalesDocumentImportID = aSelected[i].getBindingContext().getProperty("SalesDocumentImportID");
					var sSalesDocumentTemporaryID = aSelected[i].getBindingContext().getProperty("SalesDocumentTemporaryID");
					oModel.callFunction("/SetAsCompleted", {
						method: "POST",
						batchGroupId: "batchFunctionImport",
						changeSetId: i,
						urlParameters: {
							"SalesDocumentImportID": sSalesDocumentImportID,
							"SalesDocumentTemporaryID": sSalesDocumentTemporaryID
						}
					});
				}
				oModel.submitChanges({
					batchGroupId: "batchFunctionImport", // Same as the batch group id used previously
					success: this._sendRequestToSetAsCompletedSuccess.bind(this),
					error: this._sendRequestToSetAsCompletedFail.bind(this)
				});
			}
		},

		_sendRequestToSetAsCompletedSuccess: function (oData) {
			this.byId(CNSTS.IMPORT_HISTORY_ITEM_INNER_TABLE_ID).setBusy(false);
			this.onRefreshClick();
			var _oI18nResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var aBatchResponses = oData.__batchResponses;
			var iSuccessCount = 0;
			var iFailCount = 0;
			var iFailMessageTextCound = 0;
			var sPreviousFailMessageText = "";
			var sPreviousFailMessageDetail = "";
			var aMessages = [];
			var sDialogTitle = "";
			for (var j = 0; j < aBatchResponses.length; j++) {
				var oFirstChangeResponse = aBatchResponses[j].__changeResponses[0];
				var sMessageTitle = oFirstChangeResponse.data.MessageTitle;
				var sMessageText = oFirstChangeResponse.data.MessageText;
				var sMessageDetail = oFirstChangeResponse.data.MessageDetail;
				switch (oFirstChangeResponse.data.MessageType) {
				case "S":
					iSuccessCount += 1;
					aMessages.push({
						"type": sap.ui.core.MessageType.Success,
						"title": sMessageTitle,
						"subtitle": sMessageText,
						"description": sMessageDetail === "" ? sMessageText : sMessageDetail
					});
					break;
				case "E":
					iFailCount += 1;
					iFailMessageTextCound += sPreviousFailMessageText !== sMessageText ? 1 : 0;
					sPreviousFailMessageText = sMessageText;
					sPreviousFailMessageDetail = sMessageDetail;
					aMessages.push({
						"type": sap.ui.core.MessageType.Error,
						"title": sMessageTitle,
						"subtitle": sMessageText,
						"description": sMessageDetail === "" ? sMessageText : sMessageDetail
					});
					break;
				}
			}
			if (iFailCount === 0) {
				// If all are successful, show message toast
				this.byId(CNSTS.IMPORT_HISTORY_ITEM_INNER_TABLE_ID).removeSelections(true);
				if (iSuccessCount > 1) {
					sap.m.MessageToast.show(_oI18nResourceBundle.getText("SUCCESS_MESSAGE_FOR_MANUALLY_COMPLETED_ITEM", [iSuccessCount]));
				} else {
					sap.m.MessageToast.show(_oI18nResourceBundle.getText("SUCCESS_MESSAGE_FOR_SINGLE_MANUALLY_COMPLETED_ITEM"));
				}
			} else {
				var sCloseButtonText = _oI18nResourceBundle.getText("BUTTON_CLOSE");
				if (iSuccessCount === 0 && iFailMessageTextCound <= 1) {
					//If all failed, check if all error message are same, if yes, show one message in message box
					if (sPreviousFailMessageDetail === "") {
						MessageBox.error(sPreviousFailMessageText);
					} else {
						MessageBox.error(sPreviousFailMessageDetail + sPreviousFailMessageText);
					}
				} else {
					// If partially success
					sDialogTitle = iSuccessCount === 0 ? _oI18nResourceBundle.getText("TITLE_ERROR") :
						_oI18nResourceBundle.getText("TITLE_PARTIALLY_COMPLETED");
					var oMessageViewDialog = this.customUIFactory.buildMessageViewDialog(aMessages, sDialogTitle, sCloseButtonText);
					oMessageViewDialog.open();
				}
			}
		},

		_sendRequestToSetAsCompletedFail: function (oError) {
			this.byId(CNSTS.IMPORT_HISTORY_ITEM_INNER_TABLE_ID).setBusy(true);
			this.onRefreshClick();
			var _oI18nResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var sTechnicalErrorMessage = _oI18nResourceBundle.getText("TECHNICAL_ERROR_MESSAGE");
			var sCloseButtonText = _oI18nResourceBundle.getText("BUTTON_CLOSE");
			var oMessageViewDialog = this.customUIFactory.buildMessageViewDialog([{
				"type": sap.ui.core.MessageType.Error,
				"title": sTechnicalErrorMessage
			}], "", sCloseButtonText);
			oMessageViewDialog.open();
		},

		_getShouldUpdateListItems: function () {
			var sReturn = {
				allValid: true,
				aShouldUpdateListItems: []
			};
			var oProcessingStatusOS = this.byId(CNSTS.IMPORT_HISTORY_DETAIL_PAGE.PROCESSING_STATUS_OS_ID);
			var sSlsDocImprtProcessingStatus = oProcessingStatusOS.getBindingContext().getProperty("SlsDocImprtProcessingStatus");
			var aCurrentSelectedListItems = this.byId(CNSTS.IMPORT_HISTORY_ITEM_INNER_TABLE_ID).getSelectedItems();
			if ([CNSTS.PROCESSING_STATUS_CODE.CONTAINS_ERRORS].includes(sSlsDocImprtProcessingStatus) && aCurrentSelectedListItems &&
				aCurrentSelectedListItems.length >= 1) {
				for (var i = 0; i < aCurrentSelectedListItems.length; i++) {
					var oBindingContext = aCurrentSelectedListItems[i].getBindingContext();
					var sSalesDocumentCreationStatus = oBindingContext.getProperty("SalesDocumentCreationStatus");
					if ([CNSTS.CREATION_STATUS_CODE.FAILED].includes(sSalesDocumentCreationStatus)) {
						sReturn.aShouldUpdateListItems.push(aCurrentSelectedListItems[i]);
					} else {
						sReturn.allValid = false;
					}
				}
			}
			return sReturn;
		},

		_toggleSetAsCompletedUI: function () {

				this.byId(CNSTS.IMPORT_HISTORY_ITEM_SET_AS_COMPLETED_BUTTON_ID).setVisible(true);
				this.byId(CNSTS.IMPORT_HISTORY_ITEM_INNER_TABLE_ID).setMode(sap.m.ListMode.MultiSelect);
				this.byId("CountOfMnllyCmpltdLayOut").setVisible(true);

		}
	});

});