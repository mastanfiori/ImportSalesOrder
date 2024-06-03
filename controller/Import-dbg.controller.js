/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cus/sd/salesorder/imports1/utils/formatter",
	"cus/sd/salesorder/imports1/utils/commonEventHandler",
	"cus/sd/salesorder/imports1/utils/utility",
	"sap/ui/table/Column",
	"sap/ui/unified/Currency",
	"sap/m/ObjectStatus",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/MessageType",
	"sap/m/MessageBox",
	"sap/f/library",
	"sap/base/util/deepExtend",
	"sap/m/ResponsivePopover",
	"sap/m/Button",
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"sap/m/MessageStrip",
	"sap/m/Link"
], function (Controller, formatter, commonEventHandler, utility, Column, Currency, ObjectStatus, JSONModel, MessageType, MessageBox,
	fioriLibrary, deepExtend, ResponsivePopover, Button, Fragment, Item, MessageStrip, Link) {
	"use strict";
	return Controller.extend("cus.sd.salesorder.imports1.controller.Import", {

		/**  --- global variable defination area Start ---   **/
		formatter: formatter,
		commonEventHandler: commonEventHandler,

		sUploadName: "",
		sTest: "",
		sMessageStripStatusnull: "",
		sHistoryEntity: "",

		oFiledList: {},
		// Save uploaded field label(SAP label + Excel label)
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

		tempHeaderRuntimeColumns: [],
		sImportPageMessageStripId: "importPageMessageStrip",
		/**  --- global variable defination area End ---  **/

		/**  --- App prepartion logic area Start ---  **/
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cus.sd.salesorder.imports1.view.ImportSalesOrder
		 */
		onInit: function () {
			this.initialModels();
			//Prepare UI controls instances
			this.oPreviewTable = this.byId("importHeaderTable");
			this.oColumnListItem = this.byId("importHeaderListItem");
			this.oUploadCollection = this.byId("importUploadCollection");
			this.Uploader = this.byId("importFileUploader");
			this.ImportButton = this.byId("importButton");
			this.oDetailButton = this.byId("importHeaderDetailBtn");
			this.FileNameImport = this.byId("importFileNameImport");
			this.oPreviewView = this.getView();
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("master").attachPatternMatched(this.onRoutePatternMatched, this);
			//this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			this.utility = new utility(this, "Header");
			//local Json Model Name
			this.sDataModelRootPath = "importSalesOrder>";
			//Store oData Service Related Path
			var oDocModel = this.getOwnerComponent().getModel("document");
			this.sHistoryEntity = oDocModel.getProperty("/historyEntity");
			//this.setDocumentModel();
			this.oModelName = oDocModel.getProperty("/modelName");
			this.sKeyField = oDocModel.getProperty("/keyField");
			this.setUploadURL(this.oModelName);
			this._initialShareAction();
		},

		onRoutePatternMatched: function (oEvent) {
			var sLayout = oEvent.getParameters().arguments.layout;
			if (sLayout === undefined) {
				//Open App
				this.utility._hidePreviewTable();
			}
			if (this.bNavigateFromDuplicateDilog) {
				this.oUIModel.setProperty("/uploadJobName", this.sImportName);
				this.commonEventHandler._dealWithDuplicate.call(this);
			}
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

			this.oModelName = oDocModel.getProperty("/modelName");
			this.sKeyField = oDocModel.getProperty("/keyField");
			this.sHistoryEntity = oDocModel.getProperty("/historyEntity");
			this.setUploadURL(this.oModelName);
		},

		//Prepare Json and oData model instances
		initialModels: function () {
			//Initialize i18n model 
			this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			//Initialize application models
			this.oUIModel = this.getOwnerComponent().getModel("ui");
			this.oImportDataModel = this.getOwnerComponent().getModel("importSalesOrder");
			this.oP13nModel = this.getOwnerComponent().getModel("p13n");
			this.oMsgModel = this.getOwnerComponent().getModel("msgDialog");
			//Initialize metadata model "meta" from oDataModel
			var oView = this.getView();
			var oDataModel = this.getOwnerComponent().getModel();
			this.oModel = oDataModel;
			var that = this;
			if (oDataModel.getMetaModel()) {
				oDataModel.getMetaModel().loaded().then(function () {
					oView.setModel(oDataModel.getMetaModel(), "meta");
					that.prepareFieldlist(oDataModel.getMetaModel());
				});
			}
		},

		/** This method is use Metadata doc to store all property info
		 * which later will be used to render Preview Data
		 **/
		prepareFieldlist: function (oMetaModel) {
			// Use oData entity name in fixed format
			if (!oMetaModel) {
				return;
			}
			var oDocModel = this.getOwnerComponent().getModel("document");
			var sModelName = oDocModel.getProperty("/modelName");
			var sFiledEnity = oDocModel.getProperty("/importFieldEntity");
			var sItemFieldEntity = oDocModel.getProperty("/importItemFieldEntity");
			var sPricingFieldEntity = oDocModel.getProperty("/importPrincingFieldEntity");
			var sItemKeyField = oDocModel.getProperty("/keyItemField");
			//var sHistory;

			// Store Header Fields
			var oFieldListEntityType = oMetaModel.getODataEntityType(sModelName + "." + sFiledEnity);
			if (oFieldListEntityType && oFieldListEntityType.property && oFieldListEntityType.property.length > 0) {
				var aFieldList = oFieldListEntityType.property;
				for (var index in aFieldList) {
					var sName = aFieldList[index].name;
					this.oFiledList[sName] = aFieldList[index];
					//As the lable of the field SalesOrder does not display as what we expect, will change it to 'Sales Order (Temporary ID)' instead
					if (sName === this.sKeyField && typeof (aFieldList[index]["sap:label"] !== undefined)) {
						aFieldList[index]["sap:label"] = this.oResourceBundle.getText("SALES_ORDER_PREVIEW_LABEL");
					}
				}
			}

			//Store Item Fields
			var oItemEntityType = oMetaModel.getODataEntityType(sModelName + "." + sItemFieldEntity);
			if (oItemEntityType && oItemEntityType.property && oItemEntityType.property.length > 0) {
				var aItemFieldList = oItemEntityType.property;
				for (var indexItemField in aItemFieldList) {
					var sItemFieldName = aItemFieldList[indexItemField].name;
					// Regarding Sales Order Item , change the label to 'Item (Temporary ID)' and tooltip to 'Sales Order Item (Temporary ID)'
					if (sItemFieldName === sItemKeyField && typeof (aItemFieldList[indexItemField]["sap:label"] !== undefined)) {
						aItemFieldList[indexItemField]["sap:label"] = this.oResourceBundle.getText("ITEM_PREVIEW_LABEL");
						aItemFieldList[indexItemField]["sap:quickinfo"] = this.oResourceBundle.getText("ITEM_PREVIEW_TOOLTIP");
					}
					// Regarding Material , change the label to 'Product' and tooltip to 'Product Number'
					if (sItemFieldName === "Material" && typeof (aItemFieldList[indexItemField]["sap:label"] !== undefined)) {
						aItemFieldList[indexItemField]["sap:label"] = this.oResourceBundle.getText("PRODUCT_PREVIEW_LABEL");
						aItemFieldList[indexItemField]["sap:quickinfo"] = this.oResourceBundle.getText("PRODUCT_PREVIEW_TOOLTIP");
					}
					if (!this.oFiledList[sItemFieldName]) {
						this.oFiledList[sItemFieldName] = aItemFieldList[indexItemField];
					}
				}
			}

			//Store Pricing Fields
			var oPriceEntityType = oMetaModel.getODataEntityType(sModelName + "." + sPricingFieldEntity);
			if (oPriceEntityType && oPriceEntityType.property && oPriceEntityType.property.length > 0) {
				var aPriceFieldList = oPriceEntityType.property;
				for (var indexPrice in aPriceFieldList) {
					var sPriceFieldName = aPriceFieldList[indexPrice].name;
					if (!this.oFiledList[sPriceFieldName]) {
						this.oFiledList[sPriceFieldName] = aPriceFieldList[indexPrice];
					}
				}
			}

			//Text fields entity is added manually in SEGW, not in Import CDS View
			var oTextEntityType = oMetaModel.getODataEntityType(sModelName + ".SalesDocumentItemText");
			if (oTextEntityType && oTextEntityType.property && oTextEntityType.property.length > 0) {
				var aTextFieldList = oTextEntityType.property;
				for (var indexTextField in aTextFieldList) {
					var sTextFieldName = aTextFieldList[indexTextField].name;
					this.oFiledList[sTextFieldName] = aTextFieldList[indexTextField];
				}
			}

			//Business Partner Fields is also added manunaly in SEGW
			var oPartnerEntityType = oMetaModel.getODataEntityType(sModelName + ".SalesBusinessPartner");
			if (oPartnerEntityType && oPartnerEntityType.property && oPartnerEntityType.property.length > 0) {
				var aPartnerFieldList = oPartnerEntityType.property;
				for (var addIndex in aPartnerFieldList) {
					var sAddiName = aPartnerFieldList[addIndex].name;
					if (!this.oFiledList[sAddiName]) {
						this.oFiledList[sAddiName] = aPartnerFieldList[addIndex];
					}
				}
			}

			//Store info for field "ProductStandardID"
			this.oFiledList["ProductStandardID"] = {
				"name": "ProductStandardID",
				"type": "String",
				"sap:display-format": "",
				"sap:label": this.oResourceBundle.getText("GTIN_PREVIEW_LABEL"),
				"sap:quickinfo": this.oResourceBundle.getText("GTIN_PREVIEW_TOOLTIP")
			};

			return;
		},

		setUploadURL: function (sModelName) {
			var sUploadURL = "/sap/opu/odata/sap/" + sModelName + "/ExcelDataSet";
			this.oUploadCollection.setUploadUrl(sUploadURL);
			this.Uploader.setUploadUrl(sUploadURL);
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf cus.sd.salesorder.imports1.view.ImportSalesOrder
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf cus.sd.salesorder.imports1.view.ImportSalesOrder
		 * use to hide UnploadCollecation toolbar 
		 */
		onAfterRendering: function () {
			this.oUploadCollection = this.byId("importUploadCollection");
			var oToolBar = this.oUploadCollection.getToolbar();
			oToolBar.setVisible(false);
		},
		/*  --- App prepartion logic area End ---  */

		/*  --- Event handle area Start---  */
		onImportNameChange: function (oEvent) {
			var sValue = this.FileNameImport.getValue();
			sValue = typeof (sValue) === "string" ? sValue.trim() : sValue;
			var bPreviewVisible = this.oPreviewTable.getVisible();
			var bErrorType = this.sMessageStripStatus;
			//No Value Entered 
			if (sValue === undefined || sValue === "") {
				// Accoring to Preview Table Visibility to check whether a file has been uploaded successfully
				if (bPreviewVisible) {
					this.FileNameImport.setValueState("Error");
					this.FileNameImport.setValueStateText(this.oResourceBundle.getText("MSG_ENTER_IMPORT_NAME"));
					this.ImportButton.setEnabled(false);
					if (bErrorType === MessageType.Success) {
						sap.ui.getCore().byId(this.sImportPageMessageStripId).setProperty("visible", false);
					}
				}
			} else if (sValue.length > 100) {
				// If value enterred but exceed max length 
				this.FileNameImport.setValueState("Error");
				this.FileNameImport.setValueStateText(this.oResourceBundle.getText("MSG_IMPORT_NAME_MAX_LENGTH"));
				this.ImportButton.setEnabled(false);
				//Hide succesfull messagestrip
				if (bErrorType === MessageType.Success) {
					sap.ui.getCore().byId(this.sImportPageMessageStripId).setProperty("visible", false);
				}
			} else {
				// if value enterred 
				this.FileNameImport.setValueState("None");
				this.FileNameImport.setValueStateText("");
				// if there is a file uploaded show messagestrip and enable import button
				if (bPreviewVisible) {
					if (bErrorType === MessageType.Error) {
						this.ImportButton.setEnabled(false);
					} else {
						this.ImportButton.setEnabled(true);
					}
					sap.ui.getCore().byId(this.sImportPageMessageStripId).setProperty("visible", true);
				}
			}
		},

		//Cancle Button Press event handler
		onCancelPressed: function (oEvent) {
			this.utility._hidePreviewTable();
			window.history.go(-1);
		},

		//Download Button press event handler
		onDownloadTemplatePressed: function (oEvent) {
			var sRequestUri = this.getOwnerComponent().getModel().sServiceUrl + "/ExcelDataSet('')/$value";
			window.open(sRequestUri, "_self");
			return true;
		},

		onShowLogsButtonPressed: function (oEvent) {
			this.utility._hidePreviewTable();
			this.oRouter.navTo("history", {
				layout: fioriLibrary.LayoutType.OneColumn
			});
		},

		/**  --- Event handle area End ---  **/

		backToMasterPage: function () {
			var sLayout = this.oUIModel.getProperty("/layout");
			if (sLayout !== fioriLibrary.LayoutType.OneColumn) {
				//Close  middle page
				this.oRouter.navTo("master", {
					layout: fioriLibrary.LayoutType.OneColumn
				}, true);
			}
		},

		buildTable: function (aSettingHeaderFields, aSettingVisibleFields) {
			this.utility.buildPreviewTable(aSettingHeaderFields, aSettingVisibleFields);
			var sBindingPath = this.sDataModelRootPath + "/salesHeaderData";
			this.oPreviewTable.bindItems({
				path: sBindingPath,
				template: this.oColumnListItem
			});
			//In some situation, the popinchange event not fired timely after table refresh
			//Manually trigger
			//Incident 2280040939 
			this.oPreviewTable.firePopinChanged();
		},

		onImport: function (oEvent) {
			this.ImportButton.setEnabled(false);
			var oModel = this.getOwnerComponent().getModel();
			var oNewEntry = {};
			var sImportName = this.FileNameImport.getValue();
			sImportName = typeof (sImportName) === "string" ? sImportName.trim() : sImportName;
			//Prepare New Object to Create
			oNewEntry.SalesDocumentImportName = sImportName;
			oNewEntry.SlsDocImprtdFileContentHash = this.SlsDocImprtdFileContentHash;
			oNewEntry.to_ImportHistItem = this.oUploadData.to_ImportHistItem;

			var oDocModel = this.getOwnerComponent().getModel("document");
			var sImportPath = oDocModel.getProperty("/importEntity");

			oModel.create(sImportPath, oNewEntry, {
				success: this.handleImportSuccess.bind(this),
				error: this.handleImportError.bind(this)
			});
			//var oView = this.getView();
			this.oPreviewView.setBusy(true);

		},

		handleImportSuccess: function (oSuccess, oResponse) {
			//var oView = this.getView();
			this.oPreviewView.setBusy(false);
			var that = this;

			var sShowLog = this.oResourceBundle.getText("BUTTON_SHOW_LOGS");
			// var sImportName = this.FileNameImport.getValue();
			var sImportID = oResponse.data.SalesDocumentImportID;
			// sImportName = typeof (sImportName) === "string" ? sImportName.trim() : sImportName;
			MessageBox.information(
				this.oResourceBundle.getText("IMPORT_INFORMATION"), {
					actions: [sShowLog, sap.m.MessageBox.Action.OK],
					onClose: function (sAction) {
						switch (sAction) {
						case sShowLog:
							// that.oRouter.navTo("historyWithName", {
							// 	layout: fioriLibrary.LayoutType.EndColumnFullScreen,
							// 	importName: sImportName
							// });
							var sEntity = that.sHistoryEntity + "('" + sImportID + "')";
							that.oRouter.navTo("ImportHistoryDetail", {
								layout: fioriLibrary.LayoutType.OneColumn,
								entity: sEntity
							});
							break;
						case "OK":
							break;
						}
					}
				}
			);

			this.utility._hidePreviewTable();
			//this.backToMasterPage();
		},

		handleImportError: function (oError) {
			//var oView = this.getView();
			this.ImportButton.setEnabled(true);
			this.oPreviewView.setBusy(false);
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

		/**
		 * Called when personalization setting button is pressed.
		 * Use fragment P13nDialog.
		 */
		onHeaderSettingDialogPress: function () {
			var oPersonalizationDialog = sap.ui.xmlfragment("cus.sd.salesorder.imports1.view.fragment.SettingDialogForHeader", this);
			oPersonalizationDialog.setModel(this.oP13nModel);
			this.oPreviewView.addDependent(oPersonalizationDialog);
			oPersonalizationDialog.open();
		},

		onChangeColumnsItems: function (oEvent) {
			this.tempHeaderRuntimeColumns = oEvent.getParameter("items");
		},

		onHeaderSettingOk: function (oEvent) {
			if (this.tempHeaderRuntimeColumns.length !== 0) {
				this.oP13nColumns.headerRuntimeColumns = deepExtend([], this.tempHeaderRuntimeColumns);
				this.tempHeaderRuntimeColumns.length = 0;
			}
			var runtimeColumns = this.oP13nColumns.headerRuntimeColumns;
			var aSettingHeaderFields = [];
			var aSettingVisibleFields = [];
			for (var index in runtimeColumns) {
				aSettingHeaderFields.push(runtimeColumns[index].columnKey);
				if (runtimeColumns[index].visible === true) {
					aSettingVisibleFields.push(runtimeColumns[index].columnKey);
				}
			}
			this.utility.clearTable();
			this.buildTable(aSettingHeaderFields, aSettingVisibleFields);

			oEvent.getSource().close();
			this.oPreviewTable.firePopinChanged();
		},

		onHeaderSettingCancel: function (oEvent) {
			this.oP13nModel.setProperty("/headerRuntimeColumns", deepExtend([], this.oP13nColumns.headerRuntimeColumns));
			oEvent.getSource().close();
		},
		
		onShareActionList: function (oEvent) {
			//Open action list
			var oView = this.getView(), oSourceControl = oEvent.getSource();

			if (!this.ShareActionPopover) {
				this.ShareActionPopover = Fragment.load({
					id: oView.getId(),
					name: "cus.sd.salesorder.imports1.view.fragment.ActionSheet",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}

			this.ShareActionPopover.then(function (oPopover) {
				oPopover.openBy(oSourceControl);
			});
		},
		
		
		_initialShareAction : function (oEvent) {
			var oView = this.getView();
			if (!this.ShareActionPopover) {
				this.ShareActionPopover = Fragment.load({
					id: oView.getId(),
					name: "cus.sd.salesorder.imports1.view.fragment.ActionSheet",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
		},
		
		onShareEmailButton: function (oEvent) {
			//Trigger email
			sap.m.URLHelper.triggerEmail("", this.oResourceBundle.getText("TITLE_SEND_EMAIL"), window.location.href);
		}

	});

});