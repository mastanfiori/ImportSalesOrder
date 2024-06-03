/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel"],function(B,J){"use strict";return B.extend("cus.sd.salesorder.imports1.controller.App",{onInit:function(){this.oOwnerComponent=this.getOwnerComponent();this.oRouter=this.oOwnerComponent.getRouter();},onStateChanged:function(e){},onExit:function(){this.oRouter.detachRouteMatched(this.onRouteMatched,this);}});});
