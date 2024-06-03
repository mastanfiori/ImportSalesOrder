/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"./utils/models",
	"sap/f/library"
], function (UIComponent, Device, JSONModel, models, fioriLibrary) {
	"use strict";

	return UIComponent.extend("cus.sd.salesorder.imports1.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the FLP and device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			//set the oData model
			this.setModel(models.createODataModel(), "importSalesOrder");
			//set the UI model
			this.setModel(models.createUIModel(), "ui");
			//set the personalization model
			this.setModel(models.createP13nModel(), "p13n");
			//Set Message Dialog model
			this.setModel(models.createMsgDialogModel(), "msgDialog");
			
			//set the oData model
			this.setModel(models.createODataModel(), "reuploadSalesDoc");
			//set the UI model
			this.setModel(models.createUIModel(), "reuploadUi");
			//set the personalization model
			this.setModel(models.createP13nModel(), "reuploadP13n");
			//Set Message Dialog model
			this.setModel(models.createMsgDialogModel(), "reuploadMsgDialog");
			
			this.setModel(models.createSalesDocImportIDModel(), "reuploadSlsDocImprtID");
			
			this.setModel(models.createUploadDataForReuploadModel(), "reuploadData");
			
			this.setModel(models.createDocumentModel(), "document");

			var oRouter;
			oRouter = this.getRouter();
			oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
			oRouter.initialize();
		},
		_onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getModel("ui"),
				sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, set a default layout (normally OneColumn)
			// A bug for pattern "historywithstate", the sLayout should change
			var sPatternName = oEvent.getParameter("name");
			if(!sLayout) {
				sLayout = fioriLibrary.LayoutType.OneColumn;
			}
			
			oModel.setProperty("/layout", sLayout);
			
			var oResourceBundle = this.getModel("i18n").getResourceBundle();
			var sTitle;
			if (oEvent.getParameter("name") === "ImportHistoryDetail") {
				sTitle = oResourceBundle.getText("PAGE_IMPORT_DETAIL_TITLE");
			} else if (sPatternName === "history" || sPatternName === "historywithstate" ) {
				sTitle = oResourceBundle.getText("PAGE_IMPORT_History");
			} else {
				if (sLayout === fioriLibrary.LayoutType.MidColumnFullScreen) {
					sTitle = oResourceBundle.getText("PAGE_IMPORT_ITEM");
				} else {
					sTitle = oResourceBundle.getText("appTitle");
				}
			}

			this.getService("ShellUIService").then( // promise is returned
				function (oService) {
					oService.setTitle(sTitle);
				},
				function (oError) {
					jQuery.sap.log.error("Cannot get ShellUIService", oError, "my.app.Component");
				}
			);

		}

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		// destroy : function () {
		// 	this._oErrorHandler.destroy();
		// 	// call the base component's destroy function
		// 	UIComponent.prototype.destroy.apply(this, arguments);
		// },

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		// getContentDensityClass: function () {
		// 	if (this._sContentDensityClass === undefined) {
		// 		// check whether FLP has already set the content density class; do nothing in this case
		// 		// eslint-disable-next-line sap-no-proprietary-browser-api
		// 		if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
		// 			this._sContentDensityClass = "";
		// 		} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
		// 			this._sContentDensityClass = "sapUiSizeCompact";
		// 		} else {
		// 			// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
		// 			this._sContentDensityClass = "sapUiSizeCozy";
		// 		}
		// 	}
		// 	return this._sContentDensityClass;
		// }

	});

});