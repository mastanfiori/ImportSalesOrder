/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cus/sd/salesorder/imports1/utils/utility",
	"cus/sd/salesorder/imports1/utils/commonEventHandler",
	"sap/ui/core/MessageType",
	"cus/sd/salesorder/imports1/utils/formatter",
	"sap/base/util/deepExtend"
], function (Controller, utility, commonEventHandler, MessageType, formatter, deepExtend) {
	"use strict";

	return Controller.extend("cus.sd.salesorder.imports1.controller.Reupload", {

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

		onInit: function () {
			this.oPreviewTable = this.byId("reuploadHeaderTable");
			this.oColumnListItem = this.byId("reuploadHeaderListItem");
			this.oUploadCollection = this.byId("reuploadCollection");
			this.Uploader = this.byId("reuploadFileUploader");
			this.oDetailButton = this.byId("reuploadHeaderDetailBtn");
			this.FileNameImport = this.byId("reuploadFileName");
			this.utility = new utility(this, "Header", true);
			this.sDataModelRootPath = "reuploadSalesDoc>";
			var that = this;
			this.getView().attachBeforeRendering(this._BeforeViewRendering);
			this.getView().attachAfterRendering(this._AfterViewRendering, that);
		},

		initialModels: function () {
			this.oResourceBundle = this.getView().getParent().getModel("i18n").getResourceBundle();
			//Initialize application models
			this.oUIModel = this.getView().getParent().getModel("reuploadUi");
			this.oImportDataModel = this.getView().getParent().getModel("reuploadSalesDoc");
			this.oP13nModel = this.getView().getParent().getModel("reuploadP13n");
			this.oMsgModel = this.getView().getParent().getModel("reuploadMsgDialog");
			this.oSalesDocImportID = this.getView().getParent().getModel("reuploadSlsDocImprtID");
			this.oReuploadDataModel = this.getView().getParent().getModel("reuploadData");
			//Initialize metadata model "meta" from oDataModel
			this.oModel = this.getView().getParent().getModel();
		},

		_AfterViewRendering: function () {
			if (!this.oReuploadNavContainer) {
				this.initialModels();
				//Initialize i18n model 
				this.ImportButton = this.getView().getParent().getParent().getParent().getButtons()[0];
				this.oReuploaderNavContainer = this.getView().getParent().getParent();
				var oDocModel = this.getView().getParent().getModel("document");
				this.oModelName = oDocModel.getProperty("/modelName");
				this.sKeyField = oDocModel.getProperty("/keyField");
				this.setUploadURL(this.oModelName);
				this.oPreviewView = this.getView();
				var oDataModel = this.oModel;
				var oView = this.getView();
				var that = this;
				if (oDataModel.getMetaModel()) {
					oDataModel.getMetaModel().loaded().then(function () {
						oView.setModel(oDataModel.getMetaModel(), "meta");
						that.prepareFieldlist(oDataModel.getMetaModel());
					});
				}
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
			var oDocModel = this.getView().getParent().getModel("document");
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

		_BeforeViewRendering: function (oEvent) {
			var sPath = this.getParent().getBindingContext().getPath();
			var sfileName = this.getParent().getModel().getObject(sPath).SalesDocumentImportName;
			this.byId("reuploadFileName").setValue(sfileName);
		},

		setUploadURL: function (sModelName) {
			var sUploadURL = "/sap/opu/odata/sap/" + sModelName + "/ExcelDataSet";
			this.oUploadCollection.setUploadUrl(sUploadURL);
			this.Uploader.setUploadUrl(sUploadURL);
		},

		buildTable: function (aSettingHeaderFields, aSettingVisibleFields) {
			this.utility.buildPreviewTable(aSettingHeaderFields, aSettingVisibleFields);
			var sBindingPath = this.sDataModelRootPath + "/salesHeaderData";
			this.oPreviewTable.bindItems({
				path: sBindingPath,
				template: this.oColumnListItem
			});
		},

		/*
		P13n Dialog relative code
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
		}

	});
});