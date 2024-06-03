/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cus/sd/salesorder/imports1/utils/formatter",
	"sap/ui/generic/app/navigation/service/NavigationHandler",
	"sap/ui/comp/state/UIState",
	"sap/ui/generic/app/navigation/service/SelectionVariant",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/f/library",
	"cus/sd/salesorder/imports1/utils/CONSTANTS",
	"cus/sd/salesorder/imports1/utils/customUIFactory",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, formatter, NavigationHandler, UIState, SelectionVariant, ODataModel, fioriLibrary, CNSTS, customUIFactory,
	MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("cus.sd.salesorder.imports1.controller.ImportHistory", {

		formatter: formatter,
		customUIFactory: customUIFactory,
		bExpanded: false,
		sUploadName: null,
		bSmartFilterInitialized: false,

		onInit: function () {
			//this.byId("smartTable").rebindTable();
			this.oSmartFilterBar = this.byId("smartFilterBar");
			this.oSmartTable = this.byId("smartTable");
			this.oPageVariant = this.byId("PageVariant");
			this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oModel = this.getOwnerComponent().getModel();
			this.oRouter = this.getOwnerComponent().getRouter();
			//this.oRouter.attachRoutePatternMatched(this.onRoutePatternMatched, this);
			this.oRouter.getRoute("history").attachPatternMatched(this.onRoutePatternMatched, this);
			this.oRouter.getRoute("historywithstate").attachPatternMatched(this.onRoutePatternMatched, this);
			//this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			var oDocModel = this.getOwnerComponent().getModel("document");
			var sHistoryEntity = oDocModel.getProperty("/historyEntity");

			this.oSmartFilterBar.setEntitySet(sHistoryEntity);
			this.oSmartTable.setEntitySet(sHistoryEntity);

			this.bOnInitFinished = true;
			this.initAppState();

			this._toggleSetAsCompletedUI();
		},

		/** this method will only be called by application varaint app
		 * through "document" model to set oDataService related value
		 * which will be consumed in controller
		 **/
		setDocumentModel: function (oModelInfo) {
			var oDocModel = this.getOwnerComponent().getModel("document");
			if (oModelInfo) {
				if (!(oDocModel.getProperty("/bReplaced"))) {
					//var oDocModel = this.getOwnerComponent().getModel("document");
					oDocModel.setProperty("/modelName", oModelInfo.modelName);
					oDocModel.setProperty("/keyField", oModelInfo.keyField);
					oDocModel.setProperty("/keyItemField", oModelInfo.keyItemField);
					oDocModel.setProperty("/importFieldEntity", oModelInfo.importFieldEntity);
					oDocModel.setProperty("/importItemFieldEntity", oModelInfo.importItemFieldEntity);
					oDocModel.setProperty("/importPrincingFieldEntity", oModelInfo.importPrincingFieldEntity);
					oDocModel.setProperty("/importEntity", oModelInfo.importEntity);
					oDocModel.setProperty("/historyEntity", oModelInfo.historyEntity);
					oDocModel.setProperty("/historyItemEntity", oModelInfo.historyItemEntity);
					oDocModel.setProperty("/bReplaced", true);
				}
			}

			//var oDocModel = this.getOwnerComponent().getModel("document");
			var sHistoryEntity = oDocModel.getProperty("/historyEntity");

			this.oSmartFilterBar.setEntitySet(sHistoryEntity);
			this.oSmartTable.setEntitySet(sHistoryEntity);
		},

		onRoutePatternMatched: function (oEvent) {
			if (!this.oPlaceholderContainer) {
				// remember navigation container and hide placeholder later once app is ready 
				// (e.g. data loaded or header loaded, etc.)
				this.oPlaceholderContainer = oEvent.getParameter("targetControl");
			} else {
				this.oPlaceholderContainer.hidePlaceholder({
					aggregation: 'beginColumnPages'
				});
			}
		},

		onSFBInitialized: function (oEvent) {
			//this.setFilterData(this.sUploadName);
			this.bSmartFilterInitialized = true;
			this.initAppState();
		},

		onVariantLoaded: function (oEvent) {
			this.storeCurrentAppState();
		},

		setFilterData: function (sUploadName) {
			// if (this.sUploadName !== null) {
			// 	this.oSmartFilterBar.fireClear();
			// 	var oFilterData = this.oSmartFilterBar.getFilterData();
			// 	oFilterData.SalesDocumentImportName = sUploadName;
			// 	this.bExpanded = true;
			// 	this.oSmartFilterBar.setFilterData(oFilterData);
			// 	this.oSmartFilterBar.search();
			// }
		},

		initAppState: function () {
			// check if both init events for the controller and the SmartFilterBar have finished
			if (!(this.bSmartFilterInitialized && this.bOnInitFinished)) {
				return;
			}

			if (!this.oNavigationHandler) {
				this.oNavigationHandler = new NavigationHandler(this);
			}

			var oParseNavigationPromise = this.oNavigationHandler.parseNavigation();

			var that = this;
			oParseNavigationPromise.done(function (oAppData, oURLParameters, sNavType) {
				that.restoreAppState(oAppData, oURLParameters, sNavType);
			});

			oParseNavigationPromise.fail(function (oError) {
				that.hidePlaceholderOnAppStart();
				//that._handleError(oError);
			});

		},

		restoreAppState: function (oAppData, oURLParameters, sNavType) {
			if (sNavType !== sap.ui.generic.app.navigation.service.NavType.initial) {
				var bHasOnlyDefaults = oAppData && oAppData.bNavSelVarHasDefaultsOnly;
				var bVariantModified = oAppData.customData && oAppData.customData.bVariantModified;
				var sVariantID = oAppData && oAppData.tableVariantId ? oAppData.tableVariantId : "";

				if (sVariantID !== "") {
					this.oPageVariant.setCurrentVariantId(sVariantID);
					this.oSmartFilterBar.search();
				}

				if (bVariantModified) {
					/* restore filter bar */
					var oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
					var aSelectionVariantProperties = oSelectionVariant.getParameterNames().concat(oSelectionVariant.getSelectOptionsPropertyNames());
					var mUIStateProperties = {
						replace: true,
						strictMode: false
					};
					var oUiState = new UIState({
						selectionVariant: JSON.parse(oAppData.selectionVariant),
						semanticDates: typeof (oAppData.semanticDates) === "string" ? JSON.parse(oAppData.semanticDates) : {}
					});
					for (var i = 0; i < aSelectionVariantProperties.length; i++) {
						this.oSmartFilterBar.addFieldToAdvancedArea(aSelectionVariantProperties[i]);
					}
					//that.oSmartFilterBar.clearVariantSelection();
					this.oSmartFilterBar.clear();
					this.oSmartFilterBar.setUiState(oUiState, mUIStateProperties);

					/* restore Smart Table */
					if (oAppData.customData.tableSelectionVariant && oAppData.customData.tablePresentationVariant) {
						var oTableUiState = new UIState({
							selectionVariant: JSON.parse(oAppData.customData.tableSelectionVariant),
							presentationVariant: JSON.parse(oAppData.customData.tablePresentationVariant)
						});
						this.oSmartTable.setUiState(oTableUiState);
					}
					this.oSmartFilterBar.search();
				} else {
					this.hidePlaceholderOnAppStart();
				}
			}

			if (sNavType === sap.ui.generic.app.navigation.service.NavType.initial || bHasOnlyDefaults) {
				this.hidePlaceholderOnAppStart();
			}
		},

		// ---------------------------------------------
		// APP STATE HANDLING FOR BACK NAVIGATION
		// ---------------------------------------------

		/**
		 * Changes the URL according to the current app state and stores the app state for later retrieval.
		 */
		storeCurrentAppState: function () {
			var oAppStatePromise = this.oNavigationHandler.storeInnerAppState(this.getCurrentAppState());
			oAppStatePromise.fail(function (oError) {
				//this._handleError(oError);
			}.bind(this));
			return oAppStatePromise;
		},

		/**
		 * @returns {object} the current app state consisting of the selection variant, the table variant and additional custom data
		 */
		getCurrentAppState: function () {
			// Special handling for selection fields, for which defaults are defined:
			// If a field is visible in the SmartFilterBar and the user has cleared the input value, the field is not included in the selection variant, which 
			// is returned by getDataSuiteFormat() of the SmartFilterBar. But since it was cleared by purpose, we have to store the selection with the value "",
			// in order to set it again to an empty value, when restoring the selection after a back navigation. Otherwise, the default value would be set.
			var oSelectionVariant = new SelectionVariant(JSON.stringify(this.oSmartFilterBar.getUiState().getSelectionVariant()));

			return {
				tableVariantId: this.oSmartFilterBar.getCurrentVariantId(),
				selectionVariant: oSelectionVariant.toJSONString(),
				semanticDates: JSON.stringify(this.oSmartFilterBar.getUiState().getSemanticDates()),
				customData: this.getCustomAppStateData()
			};
		},

		getCustomAppStateData: function () {
			return {
				// store the information if the fitler bar variant is dirty as part of the custom data
				bVariantModified: this.oPageVariant.currentVariantGetModified(),
				// add app specific custom data for back navigation if necessary
				tableSelectionVariant: JSON.stringify(this.oSmartTable.getUiState().getSelectionVariant()),
				tablePresentationVariant: JSON.stringify(this.oSmartTable.getUiState().getPresentationVariant())
			};
		},

		// onBeforeRebindViewTable: function (oEvent) {
		// var oBindingParams = oEvent.getParameter('bindingParams');
		// //Option1
		// if (this.bExpanded) {
		// 	oBindingParams.parameters.numberOfExpandedLevels = oEvent.getSource().getTable().getGroupedColumns().length;
		// 	this.bExpanded = false;
		// } else {
		// 	oBindingParams.parameters.numberOfExpandedLevels = null;
		// }

		// },

		onSearch: function (oEvent) {
			this.storeCurrentAppState();
		},

		onVaraintSave: function (oEvent) {
			this.storeCurrentAppState();
		},

		onbeforeRebindTable: function (oEvent) {
			// var oBindingParams = oEvent.getParameter("bindingParams");
			// var oFilter = oBindingParams.filters;
			// oFilter.push(new Filter("SalesDocumentImportID", FilterOperator.EQ, this.SalesDocumentImportID));

			var oParameters = oEvent.getParameter("bindingParams");
			//set default sort order
			if (oParameters.sorter === undefined || oParameters.sorter.length === 0) {
				oParameters.sorter = [new sap.ui.model.Sorter("SalesDocumentImportDateTime", true)];
			}

			// The placeholder should be hidden after the last data request.
			oParameters.events.dataReceived = function () {
				if (this.oPlaceholderContainer) {
					this.oPlaceholderContainer.hidePlaceholder({
						aggregation: 'beginColumnPages'
					});
				}
				this.byId(CNSTS.IMPORT_HISTORY_INNER_TABLE_ID).fireSelectionChange();
			}.bind(this);
		},

		onItemPress: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext();
			//var sEntity = oBindingContext.sPath.split("/").slice(-1).pop();
			var sEntity = oBindingContext.getPath().substr(1);
			this.oRouter.navTo("ImportHistoryDetail", {
				layout: fioriLibrary.LayoutType.OneColumn,
				entity: sEntity
			});
		},

		onUploadNew: function (oEvent) {
			this.oRouter.navTo("master", {
				layout: fioriLibrary.LayoutType.OneColumn
			});
		},

		/**
		 * Checks if the users es removed "Excecute on Select" for the default variant
		 * If yes: hide the placehoder screen
		 * @public
		 */
		hidePlaceholderOnAppStart: function () {
			// check if the filter bar is initialied
			if (!this.bSmartFilterInitialized) {
				return;
			}
			if (this.oPlaceholderContainer && !this.oSmartFilterBar.isCurrentVariantExecuteOnSelectEnabled()) {
				this.oPlaceholderContainer.hidePlaceholder({
					aggregation: 'beginColumnPages'
				});
			}
		},

		onExit: function () {
			this.oRouter.getRoute("history").detachPatternMatched(this.onRoutePatternMatched, this);
			this.oRouter.getRoute("historywithstate").detachPatternMatched(this.onRoutePatternMatched, this);
		},

		onInnerTableSelectionChange: function () {
			var sReturn = this._getShouldUpdateListItems();
			var bIsManuallyCompletedButtonEnabled = sReturn.aShouldUpdateListItems.length === 0 ? false : true;
			this.byId(CNSTS.IMPORT_HISTORY_SET_AS_COMPLETED_BUTTON_ID).setEnabled(bIsManuallyCompletedButtonEnabled);
		},

		onPressSetAsCompleted: function (oEvent) {
			var _oI18n = this.getView().getModel("i18n").getResourceBundle();
			if (!this._oConfirmManuallyCompletedDialog) {
				this._oConfirmManuallyCompletedDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: _oI18n.getText("MNLLY_CMPLTD_CONFM_DIALOG_TITLE"),
					state: sap.ui.core.ValueState.Information,
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: _oI18n.getText("BUTTON_CONFIRM"),
						press: function () {
							this._sendRequestToSetAsCompleted.call(this);
							this._oConfirmManuallyCompletedDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						type: sap.m.ButtonType.Transparent,
						text: _oI18n.getText("BUTTON_CANCEL"),
						press: function () {
							this._oConfirmManuallyCompletedDialog.close();
						}.bind(this)
					})
				});
			}
			var sReturn = this._getShouldUpdateListItems();
			this._oConfirmManuallyCompletedDialog.destroyContent();
			if (sReturn.aShouldUpdateListItems.length > 1) {
				// Multiple select
				if (sReturn.allValid === true) {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ALL_VALID", [sReturn.aShouldUpdateListItems.length])
					}));
				} else {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_DIALOG_MESSAGE", [sReturn.aShouldUpdateListItems.length])
					}));
				}
			} else if (sReturn.aShouldUpdateListItems.length === 1) {
				if (sReturn.allValid === true) {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ONE_SEL", [sReturn.aShouldUpdateListItems.length])
					}));
				} else {
					this._oConfirmManuallyCompletedDialog.addContent(new sap.m.Text({
						text: _oI18n.getText("MNLLY_CMPLTD_CONFM_MSG_FOR_ONE_VALID", [sReturn.aShouldUpdateListItems.length])
					}));
				}
			} else {
				return;
			}

			this._oConfirmManuallyCompletedDialog.open();
		},

		_sendRequestToSetAsCompleted: function () {
			var sReturn = this._getShouldUpdateListItems();
			var aSelected = sReturn.aShouldUpdateListItems;
			if (aSelected && aSelected.length > 0) {
				var oModel = this.getView().getModel();
				oModel.setDeferredGroups(["batchFunctionImport"]);
				this.byId(CNSTS.IMPORT_HISTORY_INNER_TABLE_ID).setBusy(true);
				for (var i = 0; i < aSelected.length; i++) {
					var sSalesDocumentImportID = aSelected[i].getBindingContext().getProperty("SalesDocumentImportID");
					oModel.callFunction("/SetAsCompleted", {
						method: "POST",
						batchGroupId: "batchFunctionImport",
						changeSetId: i,
						urlParameters: {
							"SalesDocumentImportID": sSalesDocumentImportID,
							"SalesDocumentTemporaryID": ""
						}
					});
				}
				oModel.submitChanges({
					batchGroupId: "batchFunctionImport", // Same as the batch group id used previously
					success: this._sendRequestToSetAsCompletedSuccess.bind(this),
					error: this._sendRequestToSetAsCompletedFail.bind(this)
				});
			}
		},

		_sendRequestToSetAsCompletedSuccess: function (oData) {
			this.byId(CNSTS.IMPORT_HISTORY_INNER_TABLE_ID).setBusy(false);
			this.byId(CNSTS.IMPORT_HISTORY_SMART_TABLE_ID).rebindTable();
			var _oI18nResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var aBatchResponses = oData.__batchResponses;
			var iSuccessCount = 0;
			var iFailCount = 0;
			var iFailMessageTextCound = 0;
			var sPreviousFailMessageText = "";
			var sPreviousFailMessageDetail = "";
			var aMessages = [];
			var sDialogTitle = "";
			for (var j = 0; j < aBatchResponses.length; j++) {
				var oFirstChangeResponse = aBatchResponses[j].__changeResponses[0];
				var sMessageTitle = oFirstChangeResponse.data.MessageTitle;
				var sMessageText = oFirstChangeResponse.data.MessageText;
				var sMessageDetail = oFirstChangeResponse.data.MessageDetail;
				switch (oFirstChangeResponse.data.MessageType) {
				case "S":
					iSuccessCount += 1;
					aMessages.push({
						"type": sap.ui.core.MessageType.Success,
						"title": sMessageTitle,
						"subtitle": sMessageText,
						"description": sMessageDetail === "" ? sMessageText : sMessageDetail
					});
					break;
				case "E":
					iFailCount += 1;
					iFailMessageTextCound += sPreviousFailMessageText !== sMessageText ? 1 : 0;
					sPreviousFailMessageText = sMessageText;
					sPreviousFailMessageDetail = sMessageDetail;
					aMessages.push({
						"type": sap.ui.core.MessageType.Error,
						"title": sMessageTitle,
						"subtitle": sMessageText,
						"description": sMessageDetail === "" ? sMessageText : sMessageDetail
					});
					break;
				}
			}
			if (iFailCount === 0) {
				// If all are successful, show message toast
				this.byId(CNSTS.IMPORT_HISTORY_INNER_TABLE_ID).removeSelections(true);
				MessageToast.show(iSuccessCount > 1 ? _oI18nResourceBundle.getText("SUCCESS_MESSAGE_FOR_MANUALLY_COMPLETED", [iSuccessCount]) :
					_oI18nResourceBundle.getText("SUCCESS_MESSAGE_FOR_SINGLE_MANUALLY_COMPLETED"));
			} else {
				var sCloseButtonText = _oI18nResourceBundle.getText("BUTTON_CLOSE");
				if (iSuccessCount === 0 && iFailMessageTextCound <= 1) {
					//If all failed, check if all error message are same, if yes, show one message in message box
					if (sPreviousFailMessageDetail === "") {
						MessageBox.error(sPreviousFailMessageText);
					} else {
						MessageBox.error(sPreviousFailMessageDetail + sPreviousFailMessageText);
					}
				} else {
					// If partially success
					sDialogTitle = iSuccessCount === 0 ? _oI18nResourceBundle.getText("TITLE_ERROR") :
						_oI18nResourceBundle.getText("TITLE_PARTIALLY_COMPLETED");
					var oMessageViewDialog = this.customUIFactory.buildMessageViewDialog(aMessages, sDialogTitle, sCloseButtonText);
					oMessageViewDialog.open();
				}
			}
		},

		_sendRequestToSetAsCompletedFail: function (oError) {
			this.byId(CNSTS.IMPORT_HISTORY_INNER_TABLE_ID).setBusy(false);
			var _oI18nResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			this.byId(CNSTS.IMPORT_HISTORY_SMART_TABLE_ID).rebindTable();
			var sTechnicalErrorMessage = _oI18nResourceBundle.getText("TECHNICAL_ERROR_MESSAGE");
			var sCloseButtonText = _oI18nResourceBundle.getText("BUTTON_CLOSE");
			var oMessageViewDialog = this.customUIFactory.buildMessageViewDialog([{
				"type": sap.ui.core.MessageType.Error,
				"title": sTechnicalErrorMessage
			}], "", sCloseButtonText);
			oMessageViewDialog.open();
		},

		_getShouldUpdateListItems: function () {
			var sReturn = {
				allValid: true,
				aShouldUpdateListItems: []
			};
			var aCurrentSelectedListItems = this.byId(CNSTS.IMPORT_HISTORY_INNER_TABLE_ID).getSelectedItems();
			if (aCurrentSelectedListItems && aCurrentSelectedListItems.length >= 1) {
				for (var i = 0; i < aCurrentSelectedListItems.length; i++) {
					var oBindingContext = aCurrentSelectedListItems[i].getBindingContext();
					var sSlsDocImprtProcessingStatus = oBindingContext.getProperty("SlsDocImprtProcessingStatus");
					if ([CNSTS.WITH_ERRORS_STATUS_CODE].includes(sSlsDocImprtProcessingStatus)) {
						sReturn.aShouldUpdateListItems.push(aCurrentSelectedListItems[i]);
					} else {
						sReturn.allValid = false;
					}
				}
			}
			return sReturn;
		},

		_toggleSetAsCompletedUI: function () {
				this.byId(CNSTS.IMPORT_HISTORY_SET_AS_COMPLETED_BUTTON_ID).setVisible(true);
				this.byId(CNSTS.IMPORT_HISTORY_INNER_TABLE_ID).setMode(sap.m.ListMode.MultiSelect);
		}
	});

});