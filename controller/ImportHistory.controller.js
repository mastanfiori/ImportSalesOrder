/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/mvc/Controller","cus/sd/salesorder/imports1/utils/formatter","sap/ui/generic/app/navigation/service/NavigationHandler","sap/ui/comp/state/UIState","sap/ui/generic/app/navigation/service/SelectionVariant","sap/ui/model/odata/v2/ODataModel","sap/f/library","cus/sd/salesorder/imports1/utils/CONSTANTS","cus/sd/salesorder/imports1/utils/customUIFactory","sap/m/MessageToast","sap/m/MessageBox"],function(C,f,N,U,S,O,a,b,c,M,d){"use strict";return C.extend("cus.sd.salesorder.imports1.controller.ImportHistory",{formatter:f,customUIFactory:c,bExpanded:false,sUploadName:null,bSmartFilterInitialized:false,onInit:function(){this.oSmartFilterBar=this.byId("smartFilterBar");this.oSmartTable=this.byId("smartTable");this.oPageVariant=this.byId("PageVariant");this.oResourceBundle=this.getOwnerComponent().getModel("i18n").getResourceBundle();this.oModel=this.getOwnerComponent().getModel();this.oRouter=this.getOwnerComponent().getRouter();this.oRouter.getRoute("history").attachPatternMatched(this.onRoutePatternMatched,this);this.oRouter.getRoute("historywithstate").attachPatternMatched(this.onRoutePatternMatched,this);var D=this.getOwnerComponent().getModel("document");var h=D.getProperty("/historyEntity");this.oSmartFilterBar.setEntitySet(h);this.oSmartTable.setEntitySet(h);this.bOnInitFinished=true;this.initAppState();this._toggleSetAsCompletedUI();},setDocumentModel:function(m){var D=this.getOwnerComponent().getModel("document");if(m){if(!(D.getProperty("/bReplaced"))){D.setProperty("/modelName",m.modelName);D.setProperty("/keyField",m.keyField);D.setProperty("/keyItemField",m.keyItemField);D.setProperty("/importFieldEntity",m.importFieldEntity);D.setProperty("/importItemFieldEntity",m.importItemFieldEntity);D.setProperty("/importPrincingFieldEntity",m.importPrincingFieldEntity);D.setProperty("/importEntity",m.importEntity);D.setProperty("/historyEntity",m.historyEntity);D.setProperty("/historyItemEntity",m.historyItemEntity);D.setProperty("/bReplaced",true);}}var h=D.getProperty("/historyEntity");this.oSmartFilterBar.setEntitySet(h);this.oSmartTable.setEntitySet(h);},onRoutePatternMatched:function(e){if(!this.oPlaceholderContainer){this.oPlaceholderContainer=e.getParameter("targetControl");}else{this.oPlaceholderContainer.hidePlaceholder({aggregation:'beginColumnPages'});}},onSFBInitialized:function(e){this.bSmartFilterInitialized=true;this.initAppState();},onVariantLoaded:function(e){this.storeCurrentAppState();},setFilterData:function(u){},initAppState:function(){if(!(this.bSmartFilterInitialized&&this.bOnInitFinished)){return;}if(!this.oNavigationHandler){this.oNavigationHandler=new N(this);}var p=this.oNavigationHandler.parseNavigation();var t=this;p.done(function(A,u,n){t.restoreAppState(A,u,n);});p.fail(function(e){t.hidePlaceholderOnAppStart();});},restoreAppState:function(A,u,n){if(n!==sap.ui.generic.app.navigation.service.NavType.initial){var h=A&&A.bNavSelVarHasDefaultsOnly;var v=A.customData&&A.customData.bVariantModified;var V=A&&A.tableVariantId?A.tableVariantId:"";if(V!==""){this.oPageVariant.setCurrentVariantId(V);this.oSmartFilterBar.search();}if(v){var s=new S(A.selectionVariant);var e=s.getParameterNames().concat(s.getSelectOptionsPropertyNames());var m={replace:true,strictMode:false};var o=new U({selectionVariant:JSON.parse(A.selectionVariant),semanticDates:typeof(A.semanticDates)==="string"?JSON.parse(A.semanticDates):{}});for(var i=0;i<e.length;i++){this.oSmartFilterBar.addFieldToAdvancedArea(e[i]);}this.oSmartFilterBar.clear();this.oSmartFilterBar.setUiState(o,m);if(A.customData.tableSelectionVariant&&A.customData.tablePresentationVariant){var t=new U({selectionVariant:JSON.parse(A.customData.tableSelectionVariant),presentationVariant:JSON.parse(A.customData.tablePresentationVariant)});this.oSmartTable.setUiState(t);}this.oSmartFilterBar.search();}else{this.hidePlaceholderOnAppStart();}}if(n===sap.ui.generic.app.navigation.service.NavType.initial||h){this.hidePlaceholderOnAppStart();}},storeCurrentAppState:function(){var A=this.oNavigationHandler.storeInnerAppState(this.getCurrentAppState());A.fail(function(e){}.bind(this));return A;},getCurrentAppState:function(){var s=new S(JSON.stringify(this.oSmartFilterBar.getUiState().getSelectionVariant()));return{tableVariantId:this.oSmartFilterBar.getCurrentVariantId(),selectionVariant:s.toJSONString(),semanticDates:JSON.stringify(this.oSmartFilterBar.getUiState().getSemanticDates()),customData:this.getCustomAppStateData()};},getCustomAppStateData:function(){return{bVariantModified:this.oPageVariant.currentVariantGetModified(),tableSelectionVariant:JSON.stringify(this.oSmartTable.getUiState().getSelectionVariant()),tablePresentationVariant:JSON.stringify(this.oSmartTable.getUiState().getPresentationVariant())};},onSearch:function(e){this.storeCurrentAppState();},onVaraintSave:function(e){this.storeCurrentAppState();},onbeforeRebindTable:function(e){var p=e.getParameter("bindingParams");if(p.sorter===undefined||p.sorter.length===0){p.sorter=[new sap.ui.model.Sorter("SalesDocumentImportDateTime",true)];}p.events.dataReceived=function(){if(this.oPlaceholderContainer){this.oPlaceholderContainer.hidePlaceholder({aggregation:'beginColumnPages'});}this.byId(b.IMPORT_HISTORY_INNER_TABLE_ID).fireSelectionChange();}.bind(this);},onItemPress:function(e){var B=e.getSource().getBindingContext();var E=B.getPath().substr(1);this.oRouter.navTo("ImportHistoryDetail",{layout:a.LayoutType.OneColumn,entity:E});},onUploadNew:function(e){this.oRouter.navTo("master",{layout:a.LayoutType.OneColumn});},hidePlaceholderOnAppStart:function(){if(!this.bSmartFilterInitialized){return;}if(this.oPlaceholderContainer&&!this.oSmartFilterBar.isCurrentVariantExecuteOnSelectEnabled()){this.oPlaceholderContainer.hidePlaceholder({aggregation:'beginColumnPages'});}},onExit:function(){this.oRouter.getRoute("history").detachPatternMatched(this.onRoutePatternMatched,this);this.oRouter.getRoute("historywithstate").detachPatternMatched(this.onRoutePatternMatched,this);},onInnerTableSelectionChange:function(){var r=this._getShouldUpdateListItems();var i=r.aShouldUpdateListItems.length===0?false:true;this.byId(b.IMPORT_HISTORY_SET_AS_COMPLETED_BUTTON_ID).setEnabled(i);},onPressSetAsCompleted:function(e){var _=this.getView().getModel("i18n").getResourceBundle();if(!this._oConfirmManuallyCompletedDialog){this._oConfirmManuallyCompletedDialog=new sap.m.Dialog({type:sap.m.DialogType.Message,title:_.getText("MNLLY_CMPLTD_CONFM_DIALOG_TITLE"),state:sap.ui.core.ValueState.Information,beginButton:new sap.m.Button({type:sap.m.ButtonType.Emphasized,text:_.getText("BUTTON_CONFIRM"),press:function(){this._sendRequestToSetAsCompleted.call(this);this._oConfirmManuallyCompletedDialog.close();}.bind(this)}),endButton:new sap.m.Button({type:sap.m.ButtonType.Transparent,text:_.getText("BUTTON_CANCEL"),press:function(){this._oConfirmManuallyCompletedDialog.close();}.bind(this)})});}var r=this._getShouldUpdateListItems();this._oConfirmManuallyCompletedDialog.destroyContent();if(r.aShouldUpdateListItems.length>1){if(r.allValid===true){this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({text:_.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ALL_VALID",[r.aShouldUpdateListItems.length])}));}else{this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({text:_.getText("MNLLY_CMPLTD_CONFM_DIALOG_MESSAGE",[r.aShouldUpdateListItems.length])}));}}else if(r.aShouldUpdateListItems.length===1){if(r.allValid===true){this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({text:_.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ONE_SEL",[r.aShouldUpdateListItems.length])}));}else{this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({text:_.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ONE_VALID",[r.aShouldUpdateListItems.length])}));}}else{return;}this._oConfirmManuallyCompletedDialog.open();},_sendRequestToSetAsCompleted:function(){var r=this._getShouldUpdateListItems();var s=r.aShouldUpdateListItems;if(s&&s.length>0){var m=this.getView().getModel();m.setDeferredGroups(["batchFunctionImport"]);this.byId(b.IMPORT_HISTORY_INNER_TABLE_ID).setBusy(true);for(var i=0;i<s.length;i++){var e=s[i].getBindingContext().getProperty("SalesDocumentImportID");m.callFunction("/SetAsCompleted",{method:"POST",batchGroupId:"batchFunctionImport",changeSetId:i,urlParameters:{"SalesDocumentImportID":e,"SalesDocumentTemporaryID":""}});}m.submitChanges({batchGroupId:"batchFunctionImport",success:this._sendRequestToSetAsCompletedSuccess.bind(this),error:this._sendRequestToSetAsCompletedFail.bind(this)});}},_sendRequestToSetAsCompletedSuccess:function(D){this.byId(b.IMPORT_HISTORY_INNER_TABLE_ID).setBusy(false);this.byId(b.IMPORT_HISTORY_SMART_TABLE_ID).rebindTable();var _=this.getView().getModel("i18n").getResourceBundle();var B=D.__batchResponses;var s=0;var F=0;var i=0;var p="";var P="";var m=[];var e="";for(var j=0;j<B.length;j++){var o=B[j].__changeResponses[0];var g=o.data.MessageTitle;var h=o.data.MessageText;var k=o.data.MessageDetail;switch(o.data.MessageType){case"S":s+=1;m.push({"type":sap.ui.core.MessageType.Success,"title":g,"subtitle":h,"description":k===""?h:k});break;case"E":F+=1;i+=p!==h?1:0;p=h;P=k;m.push({"type":sap.ui.core.MessageType.Error,"title":g,"subtitle":h,"description":k===""?h:k});break;}}if(F===0){this.byId(b.IMPORT_HISTORY_INNER_TABLE_ID).removeSelections(true);M.show(s>1?_.getText("SUCCESS_MESSAGE_FOR_MANUALLY_COMPLETED",[s]):_.getText("SUCCESS_MESSAGE_FOR_SINGLE_MANUALLY_COMPLETED"));}else{var l=_.getText("BUTTON_CLOSE");if(s===0&&i<=1){if(P===""){d.error(p);}else{d.error(P+p);}}else{e=s===0?_.getText("TITLE_ERROR"):_.getText("TITLE_PARTIALLY_COMPLETED");var n=this.customUIFactory.buildMessageViewDialog(m,e,l);n.open();}}},_sendRequestToSetAsCompletedFail:function(e){this.byId(b.IMPORT_HISTORY_INNER_TABLE_ID).setBusy(false);var _=this.getView().getModel("i18n").getResourceBundle();this.byId(b.IMPORT_HISTORY_SMART_TABLE_ID).rebindTable();var t=_.getText("TECHNICAL_ERROR_MESSAGE");var s=_.getText("BUTTON_CLOSE");var m=this.customUIFactory.buildMessageViewDialog([{"type":sap.ui.core.MessageType.Error,"title":t}],"",s);m.open();},_getShouldUpdateListItems:function(){var r={allValid:true,aShouldUpdateListItems:[]};var e=this.byId(b.IMPORT_HISTORY_INNER_TABLE_ID).getSelectedItems();if(e&&e.length>=1){for(var i=0;i<e.length;i++){var B=e[i].getBindingContext();var s=B.getProperty("SlsDocImprtProcessingStatus");if([b.WITH_ERRORS_STATUS_CODE].includes(s)){r.aShouldUpdateListItems.push(e[i]);}else{r.allValid=false;}}}return r;},_toggleSetAsCompletedUI:function(){this.byId(b.IMPORT_HISTORY_SET_AS_COMPLETED_BUTTON_ID).setVisible(true);this.byId(b.IMPORT_HISTORY_INNER_TABLE_ID).setMode(sap.m.ListMode.MultiSelect);}});});