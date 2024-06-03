/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/util/MockServer","sap/ui/model/json/JSONModel","sap/base/util/UriParameters","sap/base/Log"],function(M,J,U,L){"use strict";var m,_="cus/sd/salesorder/imports1/",a=_+"localService/mockdata";var o={init:function(O){var b=O||{};return new Promise(function(r,R){var s=sap.ui.require.toUrl(_+"manifest.json"),c=new J(s);c.attachRequestCompleted(function(){var u=new U(window.location.href),j=sap.ui.require.toUrl(a),d=c.getProperty("/sap.app/dataSources/mainService"),e=sap.ui.require.toUrl(_+d.settings.localUri),f=/.*\/$/.test(d.uri)?d.uri:d.uri+"/";f=f&&new URI(f).absoluteTo(sap.ui.require.toUrl(_)).toString();if(!m){m=new M({rootUri:f});}else{m.stop();}M.config({autoRespond:true,autoRespondAfter:(b.delay||u.get("serverDelay")||500)});m.simulate(e,{sMockdataBaseUrl:j,bGenerateMissingMockData:true});var g=m.getRequests();var h=function(k,l,n){n.response=function(x){x.respond(k,{"Content-Type":"text/plain;charset=utf-8"},l);};};if(b.metadataError||u.get("metadataError")){g.forEach(function(k){if(k.path.toString().indexOf("$metadata")>-1){h(500,"metadata Error",k);}});}var E=b.errorType||u.get("errorType"),i=E==="badRequest"?400:500;if(E){g.forEach(function(k){h(i,E,k);});}m.setRequests(g);m.start();L.info("Running the app with mock data");r();});c.attachRequestFailed(function(){var e="Failed to load application manifest";L.error(e);R(new Error(e));});});},getMockServer:function(){return m;}};return o;});