/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/m/MessageView","sap/m/MessageItem","sap/m/Button","sap/m/Bar","sap/m/Title","sap/m/Dialog","cus/sd/salesorder/imports1/utils/CONSTANTS"],function(M,a,B,b,T,D,C){"use strict";return{buildMessageViewDialog:function(m,d,c,s){var o=new a({type:"{type}",title:"{title}",subtitle:"{subtitle}",description:"{description}"});var e;var f=new M({showDetailsPageHeader:false,itemSelect:function(){e.setVisible(true);},items:{path:"/messages",template:o}});e=new B({icon:"sap-icon://nav-back",visible:false,press:function(){f.navigateBack();this.setVisible(false);}});var g=new sap.m.Title({text:d});var h=new D({state:s?s:C.DEFAULT_DIALOG_STATE,content:f,customHeader:new sap.m.Bar({contentLeft:[e,g]}),beginButton:new B({press:function(){h.close();},text:c}),afterClose:function(){h.destroy();o.destroy();f.destroy();},contentHeight:"440px",contentWidth:"640px",verticalScrolling:false,draggable:true,resizable:true});h.setModel(new sap.ui.model.json.JSONModel({"messages":m}));return h;}};});
