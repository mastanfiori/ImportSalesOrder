/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cus/sd/salesorder/imports1/utils/formatter",
	"cus/sd/salesorder/imports1/utils/commonEventHandler",
	"cus/sd/salesorder/imports1/utils/utility",
	"sap/m/ObjectStatus",
	"sap/f/library",
	"sap/base/util/deepExtend",
	"sap/ui/core/Fragment",
	"sap/ui/core/Item"
], function (Controller, formatter, commonEventHandler, utility, ObjectStatus, fioriLibrary, deepExtend, Fragment, Item) {
	"use strict";

	return Controller.extend("cus.sd.salesorder.imports1.controller.Item", {
		formatter: formatter,
		commonEventHandler: commonEventHandler,
		oFiledList: {},
		bNoData: false,
		tempItemRuntimeColumns: [],

		onInit: function () {
			this.initialModels();
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();
			this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oPreviewTable = this.byId("importItemTable");
			this.oColumnListItem = this.byId("importItemListItem");
			this.oDetailButton = this.byId("importItemDetailBtn");
			this.oEnterFSBtn = this.byId("enterOrExitFullScreenBtn");
			this.oPreviewView = this.getView();
			this.formatter.setResourceBundle(this.oResourceBundle);
			// Initialize Router
			this.attachRouterEvent();
			this.sDataModelRootPath = "importSalesOrder>";
			this.utility = new utility(this, "Item");
		},
		
		initialModels: function () {
			//Initialize i18n model 
			this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			//Initialize application models
			this.oUIModel = this.getOwnerComponent().getModel("ui");
			this.oImportDataModel = this.getOwnerComponent().getModel("importSalesOrder");
			this.oP13nModel = this.getOwnerComponent().getModel("p13n");
			this.oMsgModel = this.getOwnerComponent().getModel("msgDialog");
			this.oModel = this.getOwnerComponent().getModel();
		},

		attachRouterEvent: function () {
			this.oRouter.attachRoutePatternMatched(this._onRouterPattenMatched, this);
		},

		_onRouterPattenMatched: function (oEvent) {
			var sLayout = oEvent.getParameters().arguments.layout;
			var oFullScreenBtn = this.byId("enterOrExitFullScreenBtn");
			var sIcon = oFullScreenBtn.getIcon();
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			
			if (sLayout === fioriLibrary.LayoutType.MidColumnFullScreen) {
				if (sIcon === "sap-icon://full-screen"){
					oFullScreenBtn.setIcon("sap-icon://exit-full-screen");
					var sExitFullScreenTooltip = oResourceBundle.getText("BUTTON_ITEM_TOOLTIP_EXITFULLSCREEN");
					oFullScreenBtn.setTooltip(sExitFullScreenTooltip);
					this.oUIModel.setProperty("/actionButtonsInfo", 2);
			}
			}
	           
		    if (sLayout === fioriLibrary.LayoutType.TwoColumnsMidExpanded){  
				if (sIcon === "sap-icon://exit-full-screen"){
					oFullScreenBtn.setIcon("sap-icon://full-screen");
					var sEnterFullScreenTooltip = oResourceBundle.getText("BUTTON_ITEM_TOOLTIP_ENTERFULLSCREEN");
					oFullScreenBtn.setTooltip(sEnterFullScreenTooltip);
					this.oUIModel.setProperty("/actionButtonsInfo", 1);
			}		    	
		    	
		    }

			if (oEvent.getParameter("name") === "detail") {
				this.processItemData();
				// Item Runtime Columns need to refesh, otherwise after new file uploaded, the columns info can not be refreshed
				this.aModelItemColumns = this.oP13nModel.getProperty("/itemRuntimeColumns");
				
				if (this.aModelItemColumns !== null & this.aModelItemColumns !== undefined) {
					this.itemRuntimeColumns = deepExtend([], this.aModelItemColumns);
					this.onItemSettingOk();
				} else {
					this.buildTable();
				}
			}
		},

		processItemData: function () {
			var aItems = this.oImportDataModel.getProperty("/salesItemData");
			for (var index in aItems) {
				var sStatus = this.getStatus(aItems[index]);
				aItems[index].ItemStatus = sStatus;
			}

			if (aItems && aItems.length > 0) {
				this.oImportDataModel.setProperty("/salesItemData", aItems);
				this.bNoData = false;
			} else {
				this.bNoData = true;
			}
		},

		getStatus: function (oSalesOrder) {
			for (var i in oSalesOrder) {
				if (oSalesOrder[i] === "#Err01") {
					return "Error";
				}
			}
			return "None";
		},

		buildTable: function (aSettingHeaderFields, aSettingVisibleFields) {
			if (this.bNoData) {
				this.onDeclinePress();
				return;
			}
			this.oFiledList = this.oUIModel.getProperty("/fieldList");
			var oDocModel = this.getOwnerComponent().getModel("document");
			var sKeyField = oDocModel.getProperty("/keyField");
			if (!this.oFiledList[sKeyField]) {
				this.onDeclinePress();
				return;
			}
			
			var aItemFields = this.oUIModel.getProperty("/itemFields");
			if (aSettingHeaderFields !== undefined) {
				aItemFields = aSettingHeaderFields;
			}
			
			if (!aItemFields || aItemFields.length <= 0) {
				this.onDeclinePress();
				return;
			}
			
			this.utility.buildPreviewTable(aSettingHeaderFields, aSettingVisibleFields);
			
			this.oPreviewTable.bindItems({
				path: "importSalesOrder>/salesItemData",
				template: this.oColumnListItem
			});
			//fix accessbility issue add initial focus to action button
			this.oEnterFSBtn.focus();
			
		},

		onDeclinePress: function () {
			this.oRouter.navTo("master", {
				layout: fioriLibrary.LayoutType.OneColumn
			}, true);
		},

		/**
		 * Called when personalization setting button is pressed.
		 * Use fragment P13nDialog.
		 */
		onItemSettingDialogPress: function () {
			var oPersonalizationDialog = sap.ui.xmlfragment("cus.sd.salesorder.imports1.view.fragment.SettingDialogForItem", this);
			oPersonalizationDialog.setModel(this.oP13nModel);
			this.getView().addDependent(oPersonalizationDialog);
			oPersonalizationDialog.open();
		},

		onChangeColumnsItems: function (oEvent) {
			this.tempItemRuntimeColumns = oEvent.getParameter("items");
		},

		onItemSettingOk: function (oEvent) {
			if (this.tempItemRuntimeColumns.length !== 0) {
				this.itemRuntimeColumns = deepExtend([], this.tempItemRuntimeColumns);
				this.tempItemRuntimeColumns.length = 0;
			}
			var runtimeColumns = this.itemRuntimeColumns;
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

			if (oEvent) {
				oEvent.getSource().close();
			}
			this.oPreviewTable.firePopinChanged();
		},

		onItemSettingCancel: function (oEvent) {
			this.oP13nModel.setProperty("/itemRuntimeColumns", deepExtend([], this.itemRuntimeColumns));
			oEvent.getSource().close();
			this.tempItemRuntimeColumns.length = 0;
		},
		
		onHandleEnterOrExitFullScreen: function (oEvent) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oFullScreenBtn = this.byId("enterOrExitFullScreenBtn");
			var sIcon = oFullScreenBtn.getIcon();
			switch(sIcon) {
				case "sap-icon://exit-full-screen":
					oFullScreenBtn.setIcon("sap-icon://full-screen");
					var sEnterFullScreenTooltip = oResourceBundle.getText("BUTTON_ITEM_TOOLTIP_ENTERFULLSCREEN");
					oFullScreenBtn.setTooltip(sEnterFullScreenTooltip);
					this.oUIModel.setProperty("/actionButtonsInfo", 1);
					this.oRouter.navTo("detail", {
						layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded
					}, false);
					break;
				case "sap-icon://full-screen":
					oFullScreenBtn.setIcon("sap-icon://exit-full-screen");
					var sExitFullScreenTooltip = oResourceBundle.getText("BUTTON_ITEM_TOOLTIP_EXITFULLSCREEN");
					oFullScreenBtn.setTooltip(sExitFullScreenTooltip);
					this.oUIModel.setProperty("/actionButtonsInfo", 2);
					this.oRouter.navTo("detail", {
						layout: fioriLibrary.LayoutType.MidColumnFullScreen
					}, false);
					break;
				default:
					break;
			}
		},
		
		// DEPRECATED
		onHandleFullScreen: function (oEvent) {
			this.oUIModel.setProperty("/actionButtonsInfo", 2);
			this.oRouter.navTo("detail", {
					layout: fioriLibrary.LayoutType.MidColumnFullScreen
				},
				false);
		},
		
		// DEPRECATED
		onHandleExitFullScreen: function (oEvent) {
			this.oUIModel.setProperty("/actionButtonsInfo", 1);
			this.oRouter.navTo("detail", {
					layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded
				},
				false);
		}
	});
});