/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/NumberFormat"
], function (DateFormat, NumberFormat) {
	"use strict";

	return {

		oResourceBundle: {},
		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		setResourceBundle: function (oResourceBundle) {
			this.oResourceBundle = oResourceBundle;
		},

		formatValueText: function (sValue, sText) {
			if (sValue && sText) {
				return sValue + " (" + sText + ")";
			} else if (sValue) {
				return sValue;
			} else {
				return "";
			}
		},
		formatUserName: function (sValue, sText) {
			if (sValue && sText) {
				return sText + " (" + sValue + ")";
			} else if (sValue) {
				return sValue;
			} else {
				return "";
			}
		},
		dateFormat: function (sDate) {
			if (sDate) {
				var oDateFormat = DateFormat.getDateInstance({
					style: "medium"
				});
				return oDateFormat.format(sDate);
			} else {
				return "";
			}
		},
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		setFiledText: function (sValue) {
			if (sValue && (sValue === "#Err01" || sValue === "#Err02" || sValue === "#Err03" || sValue === "#Err04" || sValue === "#Err05" || sValue === "#Err06")) {
				switch (sValue) {
				case "#Err01":
					return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");
				case "#Err02":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");
				case "#Err03":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");
				case "#Err04":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_ORDER_TYPE");
				case "#Err05":
					return this.getModel("i18n").getResourceBundle().getText("DETERMINE_ERROR");
				case "#Err06":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_VALUE");
				default:
					return "";
				}
			} else if (sValue === undefined || null) {
				return "";
			} else {
				return sValue;
			}
		},

		setIcon: function (sValue) {
			if (sValue && (sValue === "#Err01" || sValue === "#Err02" || sValue === "#Err03" || sValue === "#Err04" || sValue === "#Err05" || sValue === "#Err06")) {
				return "sap-icon://error";
			} else {
				return "";
			}
		},

		setState: function (sValue) {
			if (sValue && (sValue === "#Err01" || sValue === "#Err02" || sValue === "#Err03" || sValue === "#Err04" || sValue === "#Err05" || sValue === "#Err06")) {
				return "Error";
			} else {
				return "None";
			}
		},

		setDateFiledText: function (sDate) {
			if (sDate && (sDate === "#Err01" || sDate === "#Err02" || sDate === "#Err03")) {
				switch (sDate) {
				case "#Err01":
					return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");
				case "#Err02":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");
				case "#Err03":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");
				default:
					return "";
				}
			}

			if (sDate) {
				//var pattern = /(\d{4})(\d{2})(\d{2})/;
				//var formatedDate = sDate.replace(pattern, '$1-$2-$3');
				var formatedDate = sDate;
				if (formatedDate && Object.prototype.toString.call(new Date(formatedDate)) === Object.prototype.toString.call(new Date())) {
					var oDateFormat = DateFormat.getDateInstance({
						style: "medium"
					});
					return oDateFormat.format(new Date(formatedDate));
				}
			}

			return sDate;
		},

		setQuantityFiledText: function (sQuantity, sUnit) {
			if (sQuantity && (sQuantity === "#Err01" || sQuantity === "#Err02" || sQuantity === "#Err03")) {
				switch (sQuantity) {
				case "#Err01":
					return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");
				case "#Err02":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");
				case "#Err03":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");
				default:
					return "";
				}
			}
			var oFloatFormat = NumberFormat.getFloatInstance();
			var fQuantity = oFloatFormat.format(sQuantity);
			if (sUnit !== undefined && sUnit !== "") {
				return fQuantity + " " + sUnit;
			} else {
				return fQuantity;
			}
		},

		setImportStatusText: function (fValue) {
			/* "1" - In Process 
			   "2" - Completed
			   "3" - Scheduled
			 */
			if (fValue === "1") {
				return this.oResourceBundle.getText("STAUTS_IN_PROCESS");
			} else if (fValue === "2") {
				return this.oResourceBundle.getText("STATUS_COMPLETED");
			} else if (fValue === "0") {
				return this.oResourceBundle.getText("STATUS_SCHEDULED");
			} else {
				return "";
			}
		},

		setCreationStatusText: function (sStatus) {
			/* "0" - Scheduled
			   "1" - In Process 
			   "2" - Created
			   "3" - Failed
			 */
			if (sStatus === "0") {
				return this.oResourceBundle.getText("STATUS_SCHEDULED");
			} else if (sStatus === "1") {
				return this.oResourceBundle.getText("STAUTS_IN_PROCESS");
			} else if (sStatus === "2") {
				return this.oResourceBundle.getText("STAUTS_CREATED");
			} else if (sStatus === "3") {
				return this.oResourceBundle.getText("STAUTS_FAILED");
			} else {
				return "";
			}
		},

		setCreationStatusState: function (sStatus) {
			/* "0" - Scheduled
			   "1" - In Process 
			   "2" - Created
			   "3" - Failed
			 */
			if (sStatus === "3") {
				return "Error";
			} else {
				return "None";
			}
		},
		setNumberofFailedState: function (sStatus) {
			/* "0" - In Process
			   "1" - With Errors
			   "2" - Completed
			   "3" - Manually Completed
			 */
			if (sStatus === "1") {
				return "Error";
			} else {
				return "None";
			}
		},
		setOverallStatusState: function (sStatus) {
			/* "0" - In Process
			   "1" - With Errors
			   "2" - Completed
			   "3" - Manually Completed
			 */
			if (sStatus === "1") {
				return "Error";
			} else if (sStatus === "0") {
				return "Warning";
			} else {
				return "None";
			}
		},

		setCreationHighlight: function (sStatus) {
			/* "0" - Scheduled
			   "1" - In Process 
			   "2" - Created
			   "3" - Failed
			 */
			if (sStatus === "3") {
				return "Error";
			} else {
				return "None";
			}
		},

		setHeaderHighlight: function (criticality) {
			/* Criticality
			0 - Grey color
			1 - Red color
			2 - yellow color
			3 - green color
			 */

			if (criticality === 1) {
				return "Error";
			} else if (criticality === 2) {
				return "Warning";
			} else {
				return "None";
			}
		},

		setIconForLog: function (sCreationStatus, sLogHandle) {
			if (sLogHandle !== "") {
				/* "0" - Scheduled
				   "1" - In Process 
				   "2" - Created
				   "3" - Failed
				   "4" - Manually Completed
				 */
				if (sCreationStatus === "0" || sCreationStatus === "1") {
					return "";
				} else if (sCreationStatus === "2" || sCreationStatus === "3" || sCreationStatus === "4") {
					return "sap-icon://message-information";
				} else {
					return "sap-icon://message-popup";
				}
			} else {
				return "";
			}
		},

		setIconColorForLog: function (sCreationStatus) {
			/* "0" - Scheduled
			   "1" - In Process 
			   "2" - Created
			   "3" - Failed
			 */
			if (sCreationStatus) {
				return sap.ui.core.IconColor.Neutral;
			} else {
				return "transparent";
			}
		},

		setIconForText: function (sValue) {
			if (Array.isArray(sValue) && sValue.length > 0) {
				return "sap-icon://document-text";
			} else {
				return "";
			}
		},

		// setModelForText: function (sValue) {
		// 	return "Test";
		// },

		setStatusForText: function (sValue) {
			return "Information";
		},

		setActiveForText: function (sValue) {
			if (Array.isArray(sValue) && sValue.length > 0) {
				return true;
			} else {
				return false;
			}
		},

		formatRatio: function (sValue) {
			if (sValue && (sValue === "#Err01" || sValue === "#Err02" || sValue === "#Err03" || sValue === "#Err04" || sValue === "#Err05")) {
				switch (sValue) {
				case "#Err01":
					return this.getModel("i18n").getResourceBundle().getText("MISSING_FIELD");
				case "#Err02":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_LENGTH");
				case "#Err03":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_FORMAT");
				case "#Err04":
					return this.getModel("i18n").getResourceBundle().getText("INVALID_ORDER_TYPE");
				case "#Err05":
					return this.getModel("i18n").getResourceBundle().getText("DETERMINE_ERROR");
				default:
					return "";
				}
			} else if (sValue === undefined || null) {
				return "";
			} else {
				return sValue + "%";
			}
		}
	};

});
