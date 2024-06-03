/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/format/DateFormat","sap/ui/core/format/NumberFormat"],function(D,N){"use strict";return{oResourceBundle:{},setResourceBundle:function(r){this.oResourceBundle=r;},formatValueText:function(v,t){if(v&&t){return v+" ("+t+")";}else if(v){return v;}else{return"";}},formatUserName:function(v,t){if(v&&t){return t+" ("+v+")";}else if(v){return v;}else{return"";}},dateFormat:function(d){if(d){var o=D.getDateInstance({style:"medium"});return o.format(d);}else{return"";}},numberUnit:function(v){if(!v){return"";}return parseFloat(v).toFixed(2);},setFiledText:function(v){if(v&&(v==="#Err01"||v==="#Err02"||v==="#Err03"||v==="#Err04"||v==="#Err05"||v==="#Err06")){switch(v){case"#Err01":return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");case"#Err02":return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");case"#Err03":return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");case"#Err04":return this.getModel("i18n").getResourceBundle().getText("INVALID_ORDER_TYPE");case"#Err05":return this.getModel("i18n").getResourceBundle().getText("DETERMINE_ERROR");case"#Err06":return this.getModel("i18n").getResourceBundle().getText("INVALID_VALUE");default:return"";}}else if(v===undefined||null){return"";}else{return v;}},setIcon:function(v){if(v&&(v==="#Err01"||v==="#Err02"||v==="#Err03"||v==="#Err04"||v==="#Err05"||v==="#Err06")){return"sap-icon://error";}else{return"";}},setState:function(v){if(v&&(v==="#Err01"||v==="#Err02"||v==="#Err03"||v==="#Err04"||v==="#Err05"||v==="#Err06")){return"Error";}else{return"None";}},setDateFiledText:function(d){if(d&&(d==="#Err01"||d==="#Err02"||d==="#Err03")){switch(d){case"#Err01":return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");case"#Err02":return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");case"#Err03":return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");default:return"";}}if(d){var f=d;if(f&&Object.prototype.toString.call(new Date(f))===Object.prototype.toString.call(new Date())){var o=D.getDateInstance({style:"medium"});return o.format(new Date(f));}}return d;},setQuantityFiledText:function(q,u){if(q&&(q==="#Err01"||q==="#Err02"||q==="#Err03")){switch(q){case"#Err01":return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");case"#Err02":return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");case"#Err03":return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");default:return"";}}var f=N.getFloatInstance();var Q=f.format(q);if(u!==undefined&&u!==""){return Q+" "+u;}else{return Q;}},setImportStatusText:function(v){if(v==="1"){return this.oResourceBundle.getText("STAUTS_IN_PROCESS");}else if(v==="2"){return this.oResourceBundle.getText("STATUS_COMPLETED");}else if(v==="0"){return this.oResourceBundle.getText("STATUS_SCHEDULED");}else{return"";}},setCreationStatusText:function(s){if(s==="0"){return this.oResourceBundle.getText("STATUS_SCHEDULED");}else if(s==="1"){return this.oResourceBundle.getText("STAUTS_IN_PROCESS");}else if(s==="2"){return this.oResourceBundle.getText("STAUTS_CREATED");}else if(s==="3"){return this.oResourceBundle.getText("STAUTS_FAILED");}else{return"";}},setCreationStatusState:function(s){if(s==="3"){return"Error";}else{return"None";}},setNumberofFailedState:function(s){if(s==="1"){return"Error";}else{return"None";}},setOverallStatusState:function(s){if(s==="1"){return"Error";}else if(s==="0"){return"Warning";}else{return"None";}},setCreationHighlight:function(s){if(s==="3"){return"Error";}else{return"None";}},setHeaderHighlight:function(c){if(c===1){return"Error";}else if(c===2){return"Warning";}else{return"None";}},setIconForLog:function(c,l){if(l!==""){if(c==="0"||c==="1"){return"";}else if(c==="2"||c==="3"||c==="4"){return"sap-icon://message-information";}else{return"sap-icon://message-popup";}}else{return"";}},setIconColorForLog:function(c){if(c){return sap.ui.core.IconColor.Neutral;}else{return"transparent";}},setIconForText:function(v){if(Array.isArray(v)&&v.length>0){return"sap-icon://document-text";}else{return"";}},setStatusForText:function(v){return"Information";},setActiveForText:function(v){if(Array.isArray(v)&&v.length>0){return true;}else{return false;}},formatRatio:function(v){if(v&&(v==="#Err01"||v==="#Err02"||v==="#Err03"||v==="#Err04"||v==="#Err05")){switch(v){case"#Err01":return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");case"#Err02":return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");case"#Err03":return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");case"#Err04":return this.getModel("i18n").getResourceBundle().getText("INVALID_ORDER_TYPE");case"#Err05":return this.getModel("i18n").getResourceBundle().getText("DETERMINE_ERROR");default:return"";}}else if(v===undefined||null){return"";}else{return v+"%";}}};});
