/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/base/util/ObjectPath",
	'sap/f/library'
], function (JSONModel, Device, ObjectPath,fioriLibrary) {
	"use strict";

	return {
		createDeviceModel : function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		//Store data for UI rendering 
		createUIModel: function () {
			var oModel = new JSONModel({
				HeaderFields: [],
				ItemFields: [],
				PricingElements: [],
				ItemPricingElements: [],
				//HeaderTextFields: [],
				//ItemTextFields: [],
				HeaderTextDesc: {},
				ItemTextDesc: {},
				HeaderPrice: [],
				ItemPrice: [],
				FieldList: {},
				Title: "",
				UploadJobName:"",
				layout:fioriLibrary.LayoutType.OneColumn,
				MessageVisibility: false,
				actionButtonsInfo: 1
			});
			return oModel;
		},
		//Store parse data from excel
		createODataModel: function () {
			var oModel = new JSONModel({
				salesHeaderData: [],
				salesItemData:[]
			});
			oModel.setSizeLimit(10000000);
			return oModel;
		},
		//Store data used by p13n setting dialog
		createP13nModel: function () {
			var oModel = new JSONModel({
				headerColumns: [],
				itemColumns: [],
				headerRuntimeColumns: [],
				itemRuntimeColumns:[]
			});
			return oModel;
		},
        //Store data used by MessageDialog
		createMsgDialogModel: function () {
			var oModel = new JSONModel({
				messages: [],
				MsgStripLinkText: ""
			});
			return oModel;
		},
		// Store service related value for application variant usage
		createDocumentModel: function() {
			var oModel = new JSONModel({
				modelName: "SD_SALES_ORDER_IMPORT",
				keyField: "SalesOrder",
				keyItemField: "SalesOrderItem",
				importFieldEntity: "I_SalesOrderImportType",
				importItemFieldEntity :"I_SalesOrderItemImportType",
				importPrincingFieldEntity: "I_SalesOrderPricingElementType",
				importEntity: "/C_SalesOrderImportHistory",
				historyEntity: "C_SalesOrderImportHistory",
				historyItemEntity: "C_SalesOrderImportHistoryItem",
				bReplaced: false
			});
			return oModel;
		},
		
		createSalesDocImportIDModel: function() {
			var oModel = new JSONModel({
				SalesDocImportID: ""
			});
			return oModel;
		},
		
		createUploadDataForReuploadModel: function() {
			var oModel = new JSONModel({
				reuploadData: {}
			});
			return oModel;
		},
		
		
		// createFLPModel : function () {
		// 	var fnGetUser = ObjectPath.get("sap.ushell.Container.getUser"),
		// 		bIsShareInJamActive = fnGetUser ? fnGetUser().isJamActive() : false,
		// 		oModel = new JSONModel({
		// 			isShareInJamActive: bIsShareInJamActive
		// 		});
		// 	oModel.setDefaultBindingMode("OneWay");
		// 	return oModel;
		// }
	};
});