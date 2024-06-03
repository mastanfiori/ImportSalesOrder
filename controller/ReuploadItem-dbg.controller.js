/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cus/sd/salesorder/imports1/utils/formatter",
	"cus/sd/salesorder/imports1/utils/utility",
	"cus/sd/salesorder/imports1/utils/commonEventHandler",
	"sap/base/util/deepExtend"
], function (Controller, formatter, utility, commonEventHandler, deepExtend) {
	"use strict";

	return Controller.extend("cus.sd.salesorder.imports1.controller.ReuploadItem", {
		formatter: formatter,
		commonEventHandler: commonEventHandler,
		oFiledList: {},
		bNoData: false,
		tempItemRuntimeColumns: [],

		onInit: function () {
			this.oPreviewTable = this.byId("reuploadItemTable");
			this.oColumnListItem = this.byId("reuploadItemListItem");
			this.oDetailButton = this.byId("reuploadItemDetailBtn");
			this.utility = new utility(this, "Item", true);
			this.sDataModelRootPath = "reuploadSalesDoc>";
			var that = this;
			this.getView().attachAfterRendering(this._AfterViewRendering, that);
		},

		initialModels: function () {
			//Initialize i18n model 
			this.oResourceBundle = this.getView().getParent().getModel("i18n").getResourceBundle();
			//Initialize application models
			this.oUIModel = this.getView().getParent().getModel("reuploadUi");
			this.oImportDataModel = this.getView().getParent().getModel("reuploadSalesDoc");
			this.oP13nModel = this.getView().getParent().getModel("reuploadP13n");
			this.oMsgModel = this.getView().getParent().getModel("reuploadMsgDialog");
			this.oModel = this.getView().getParent().getModel();
		},

		_AfterViewRendering: function () {
			if (!this.oReuploadNavContainer) {
				this.initialModels();
				this.oPreviewView = this.getView();
				this.oReuploadNavContainer = this.getView().getParent().getParent();
				this.oResourceBundle = this.getView().getParent().getModel("i18n").getResourceBundle();
				var that = this;
				this.oReuploadNavContainer.attachAfterNavigate(this._onHeaderNavToItemPage, that);
				this.reuploadNavBackButton = this.getView().getParent().getParent().getParent().getCustomHeader().getContentLeft()[0];
				this.reuplpadDialogTitle = this.getView().getParent().getParent().getParent().getCustomHeader().getContentLeft()[1];
			}
		},

		_onHeaderNavToItemPage: function (oEvent) {
			if (oEvent.getParameter("fromId").indexOf("header") !== -1) {
				this.reuplpadDialogTitle.setText(this.oResourceBundle.getText("REUPLOAD_DIALOG_ITEM_TITLE"));
				this.reuploadNavBackButton.setVisible(true);
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
			var oDocModel = this.getView().getParent().getModel("document");
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
			var sBindingPath = this.sDataModelRootPath + "/salesItemData";
			this.oPreviewTable.bindItems({
				path: sBindingPath,
				template: this.oColumnListItem
			});
		},

		/**
		 * Called when personalization setting button is pressed.
		 * Use fragment P13nDialog.
		 */
		onItemSettingDialogPress: function () {
			var oPersonalizationDialog = sap.ui.xmlfragment("cus.sd.salesorder.imports1.view.fragment.SettingDialogForItem", this);
			oPersonalizationDialog.setModel(this.oP13nModel);
			this.oPreviewView.addDependent(oPersonalizationDialog);
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

	});
});