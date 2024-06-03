/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([], function () {
	"use strict";

	return {
		"WITH_ERRORS_STATUS_CODE": "1",

		"PROCESSING_STATUS_CODE": {
			"IN_PROCESS": "0",
			"CONTAINS_ERRORS": "1",
			"COMPLETED": "2",
			"MANUALLY_COMPLETED": "3"
		},

		"CREATION_STATUS_CODE": {
			"SCHEDULED": "0",
			"IN_PROCESS": "1",
			"CREATED": "2",
			"FAILED": "3",
			"MANUALLY_COMPLETED": "4"
		},

		"IMPORT_HISTORY_SET_AS_COMPLETED_BUTTON_ID": "importHistorySetAsCompletedButton",
		"IMPORT_HISTORY_SMART_TABLE_ID": "smartTable",
		"IMPORT_HISTORY_INNER_TABLE_ID": "importHistoryInnerTable",

		"IMPORT_HISTORY_ITEM_SET_AS_COMPLETED_BUTTON_ID": "importHistoryItemSetAsCompletedButton",
		"IMPORT_HISTORY_ITEM_SMART_TABLE_ID": "importHistoryItemSmartTable",
		"IMPORT_HISTORY_ITEM_INNER_TABLE_ID": "importHistoryItemInnerTable",

		"IMPORT_HISTORY_DETAIL_PAGE": {
			"PROCESSING_STATUS_OS_ID": "importHistoryProcessingStatusOS"
		},

		"SET_AS_COMPLETED_MODEL_URL": "/sap/opu/odata/sap/SD_SALES_DOC_IMPORT",

		"DEFAULT_DIALOG_STATE": sap.ui.core.ValueState.Error
	};
});