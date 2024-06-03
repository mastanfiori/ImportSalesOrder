/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/m/MessageBox","sap/m/UploadCollectionParameter","sap/f/library","sap/ui/unified/FileUploaderParameter","sap/ui/core/Fragment","sap/m/Link","sap/m/Title","sap/m/Label","sap/ui/layout/HorizontalLayout"],function(M,U,f,F,a,L,T,b,H){"use strict";return{oController:{},onTypeMissMatch:function(e){M.error(this.oResourceBundle.getText("MSG_WRONG_FILE_TYPE"));},onfileSizeExceed:function(e){M.error(this.oResourceBundle.getText("MSG_FILE_SIZE"));},onBeforeUploadStarts:function(e){if(!this.utility.isCorrectUpload(e)){var u=e.getParameters().fileName;u=this.utility.processFileName(u);var i="";}else{u=this.FileNameImport.getValue();i=this.oSalesDocImportID.getProperty("/SalesDocImportID");}var s=i+" |"+u;this.oUIModel.setProperty("/uploadJobName",u);e.getParameters().addHeaderParameter(new U({name:"slug",value:encodeURIComponent(s)}));e.getParameters().addHeaderParameter(new U({name:"X-CSRF-Token",value:this.oModel.getSecurityToken()}));var v=this.getView();v.setBusy(true);},handleFileChange:function(e){if(!this.Uploader.getValue()){return;}if(!this.utility.isCorrectUpload(e)){var u=e.getParameters().files[0].name;u=this.utility.processFileName(u);var i="";}else{u=this.FileNameImport.getValue();i=this.oSalesDocImportID.getProperty("/SalesDocImportID");}this.oUIModel.setProperty("/uploadJobName",u);var s=i+" |"+u;this.Uploader.destroyHeaderParameters();this.Uploader.addHeaderParameter(new F({name:"slug",value:encodeURIComponent(s)}));this.Uploader.addHeaderParameter(new F({name:"X-CSRF-Token",value:this.oModel.getSecurityToken()}));this.Uploader.setSendXHR(true);this.Uploader.upload();var v=this.getView();v.setBusy(true);},handleUploadComplete:function(e){if(e.getParameter("id").indexOf("reupload")!==-1){var r=true;}else{r=false;}var t=e.getSource();var R;if(t instanceof sap.m.UploadCollection){R=e.getParameters();}else if(t instanceof sap.ui.unified.FileUploader){R=e;this.Uploader.setSendXHR(false);}else{this.oPreviewView.setBusy(false);return;}if(!this.utility.isCorrectUpload(e)){this.backToMasterPage();}else{}var g=this.oResourceBundle.getText("MSG_NO_DATA_RETURN");var s=this.oResourceBundle.getText("MSG_ERROR_OCCUR");var c=jQuery.parseXML(R.getParameters().responseRaw);if(c===""||c===undefined||c===null){this.oPreviewView.setBusy(false);M.error(g);return;}var E=c.querySelectorAll("error");if(E.length>0){var m=E[0].getElementsByTagName("message");var d;if(m&&m.length>0){d=m[0].textContent?m[0].textContent:s;}else{d=s;}M.error(d);this.oPreviewView.setBusy(false);return;}var u=c.querySelectorAll("UploadStatus");var h=c.querySelectorAll("DetailMessage");if(u.length<=0||h.length<=0){return;}var D=c.querySelectorAll("DetailMessage")[0].textContent;try{var j=JSON.parse(D).MESSAGES;}catch(k){j=[];}var l=c.querySelectorAll("UploadStatus")[0].textContent;var G=["Error","TechFLDError","FileSizeError","ReuploadError"];if(G.indexOf(l)!==-1){this.oPreviewView.setBusy(false);if(j.length===0){M.error(g);}else{var n="";for(var i in j){n=(n==="")?j[i].TITLE:n+"<br>"+j[i].TITLE;}if(l==="TechFLDError"){M.error(g,{details:n});}else if(l==="FileSizeError"||l==="ReuploadError"){M.error(n);}}return;}if(c.querySelectorAll("DuplicateImports")[0]){this.bHasDuplicateImports=c.querySelectorAll("DuplicateImports")[0].textContent.length!==0;}if(c.querySelectorAll("SalesDocFileHash")[0]){this.SlsDocImprtdFileContentHash=c.querySelectorAll("SalesDocFileHash")[0].textContent;}else{this.SlsDocImprtdFileContentHash="";}this.response=c;this.bReupload=r;if(this.bHasDuplicateImports&&!this.bReupload){this.commonEventHandler._dealWithDuplicate.call(this);}else{this.commonEventHandler._dealWithReturnData.call(this);}},_dealWithDuplicate:function(p){var d=this.response.querySelectorAll("DuplicateImports")[0].textContent;var v=this.getView();try{this.oDuplicateImports=JSON.parse(d);}catch(e){return;}if(!this._pDuplicatePopover){this._pDuplicatePopover=a.load({id:"duplicateItemsPopoverID",name:"cus.sd.salesorder.imports1.view.fragment.DuplicateImports",controller:this}).then(function(P){v.addDependent(P);return P;});}this._pDuplicatePopover.then(function(P){P.open();});},_dealWithReturnData:function(p){var r=this.response.querySelectorAll("UploadContent");var c=this.response.querySelectorAll("UploadFields");var d=this.response.querySelectorAll("DetailMessage")[0].textContent;var g=this.oResourceBundle.getText("MSG_NO_DATA_RETURN");this.utility.processFieldList(c);this.utility.splitFieldList(c);var n=this.oResourceBundle.getText("MSG_NO_SALES_ORDER");if(r&&r.length>0){var u=r[0].textContent;try{var o=JSON.parse(u);}catch(e){this.oPreviewView.setBusy(false);M.error(n);return;}if(o!==undefined&&o!==null&&o!==""){if(o.to_ImportHistItem!==undefined){this.utility.parseMessageContent(d);this.utility.processReturnData(o,this.bReupload);}}else{M.error(n);}}else{M.error(g);}this.oPreviewView.setBusy(false);},onShowDetailsInDuplicate:function(e){var d=e.getSource().getParent();var D=this.oDuplicateImports.UPLOADFIELDS;e.getSource().destroy();for(var i in D){if(D[i].SALESDOCUMENTIMPORTID){d.addContent(new L({text:"∙ "+D[i].SALESDOCUMENTIMPORTNAME}).setEmphasized(true).attachPress(this.commonEventHandler._navigateToHistoryDetail.bind(this,D[i].SALESDOCUMENTIMPORTID)));}else{d.addContent(new T({text:"∙ "+D[i].SALESDOCUMENTIMPORTNAME,titleStyle:"H6"}).addStyleClass("myCustomText"));}var l="Imported By: "+D[i].CREATEDBYUSERNAME+" ("+D[i].CREATEDBYUSER+")";var s="Imported On: "+this.commonEventHandler._parseTimestamp(D[i].SALESDOCUMENTIMPORTDATETIME);var c=l+" · "+s;d.addContent(new b({text:c}).addStyleClass("sapUiSmallMarginBottom sapUiTinyMarginBegin"));}},_parseTimestamp:function(p){var s=String(p);var c=s.substring(4,6)+"/"+s.substring(6,8)+"/"+s.substring(0,4);var d=s.substring(8,10)+":"+s.substring(10,12)+":"+s.substring(12,14);return c+", "+d;},_navigateToHistoryDetail:function(i){this.bNavigateFromDuplicateDilog=true;this.sImportName=this.oUIModel.getProperty("/uploadJobName");var e=this.sHistoryEntity+"('"+i+"')";this.commonEventHandler._destoryDuplicateItemsDialog.call(this);this.oRouter.navTo("ImportHistoryDetail",{layout:f.LayoutType.OneColumn,entity:e});},onUploadWithDuplicate:function(){if(this.bNavigateFromDuplicateDilog){this.bNavigateFromDuplicateDilog=false;this.sImportName=null;}this.commonEventHandler._destoryDuplicateItemsDialog.call(this);this.commonEventHandler._dealWithReturnData.call(this);},_destoryDuplicateItemsDialog:function(){var t=this;this._pDuplicatePopover.then(function(p){p.destroy();t._pDuplicatePopover=null;});},onCancelUploadSinceDuplicate:function(){if(this.bNavigateFromDuplicateDilog){this.bNavigateFromDuplicateDilog=false;this.sImportName=null;}this.commonEventHandler._destoryDuplicateItemsDialog.call(this);this.oPreviewView.setBusy(false);},onListItemPress:function(e){if(!this.utility.isCorrectUpload(e)){var B=e.getSource().getBindingContext("importSalesOrder").getObject();}else{B=e.getSource().getBindingContext("reuploadSalesDoc").getObject();}var k="SalesDocumentTemporaryID";var s=B[k];var S=this.oImportDataModel.getProperty("/salesHeaderData");this.oUIModel.setProperty("/Title",s);function c(o){return o[k]===s;}var i=S.filter(c);s=s===""?" ":s;this.oImportDataModel.setProperty("/salesItemData",i[0].to_Item);this.oUIModel.setProperty("/actionButtonsInfo",1);this.oUIModel.setProperty("/fieldList",this.oFiledList);if(!this.utility.isCorrectUpload(e)){this.oRouter.navTo("detail",{layout:f.LayoutType.TwoColumnsMidExpanded},true);}else{this.oReuploaderNavContainer.to(this.oReuploaderNavContainer.getPages()[1].getId());}},onHandleShowHideDetail:function(e){var h=this.oPreviewTable.getHiddenInPopin();if(h&&h.length===1){this.utility.showTableDetail();}else{this.utility.hideTableDetail();}},onPopinChanged:function(e){var t=e.getParameters();if(t&&t.hasOwnProperty("hasPopin")&&t.hasOwnProperty("hiddenInPopin")){if(!t.hasPopin&&t.hiddenInPopin.length===0){this.oDetailButton.setVisible(false);}else{this.oDetailButton.setVisible(true);}}else{this.oDetailButton.setVisible(false);}},handleTextCloseButton:function(){var t=this;this._pTextPopover.then(function(p){p.destroy();t._pTextPopover=null;});}};});