/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("cus.sd.salesorder.imports1.controller.App", {
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
		    this.oRouter = this.oOwnerComponent.getRouter();
			//this.oRouter.attachRouteMatched(this.onRouteMatched, this);
		},

		onStateChanged: function (oEvent) {
			// var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
			// 	sLayout = oEvent.getParameter("layout");

			// // Replace the URL with the new layout if a navigation arrow was used
			// if (bIsNavigationArrow) {
			// 	this.oRouter.navTo(this.currentRouteName, {layout: sLayout}, true);
			// }
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
		}
	});

});