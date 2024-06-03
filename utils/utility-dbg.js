/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/m/Button",
	"sap/ui/core/MessageType",
	"sap/m/MessageBox",
	"sap/m/MessageStrip",
	"sap/m/Link",
	"sap/m/ObjectStatus",
	"sap/m/Column",
	"sap/m/Label",
	"sap/base/util/deepExtend",
	"sap/ui/core/library",
	"sap/ui/core/Fragment",
	"sap/ui/core/Item",
	"sap/ui/core/InvisibleMessage",
], function (Object, Button, MessageType, MessageBox, MessageStrip, Link, ObjectStatus, Column, Label,
	deepExtend, library, Fragment, Item, InvisibleMessage) {
	"use strict";

	var InvisibleMessageMode = library.InvisibleMessageMode;
	return Object.extend("cus.sd.salesorder.imports1.utils.utility", {

		oController: {},
		sMode: "",
		oTextJson: [],
		bReupload: false,

		constructor: function (oController, sMode, bReupload) {
			sap.ui.base.Object.apply(this);
			this.oController = oController;
			this.setUtilityMode(sMode);
			this.bReupload = bReupload? true: false;
		},

		setUtilityMode: function (sMode) {
			if (sMode) {
				this.sMode = sMode;
				if (sMode === "Header") {
					this.sFieldPath = "/headerFields";
					this.sDataPath = "/salesHeaderData";
					this.sPriceField = "/headerPrice";
					this.sPriceName = "HEADER_PRICE.";

					this.sTextName = "HEADER_TEXT";
					this.sTextPath = "to_HeaderText";
					this.sTextPopoverId = "headerTextPopover";
					this.sTextDescPath = "/headerTextDesc";
				} else if (sMode === "Item") {
					this.sFieldPath = "/itemFields";
					this.sDataPath = "/salesItemData";
					this.sPriceField = "/itemPrice";
					this.sPriceName = "ITEM_PRICE.";

					this.sTextName = "ITEM_TEXT";
					this.sTextPath = "to_ItemText";
					this.sTextPopoverId = "itemTextPopover";
					this.sTextDescPath = "/itemTextDesc";
				}
			}
		},

		setController: function (oController) {
			this.oController = oController;
		},
		/** Preview Table handling methods **/
		_showPreviewTable: function () {
			this.oController.oUploadCollection.removeAllItems();
			this.oController.oUploadCollection.setVisible(false);
			this.oController.oPreviewTable.setVisible(true);
		},

		_hidePreviewTable: function () {
			this.oController.FileNameImport.setValue("");
			//Clear data stores in models
			var oMs = sap.ui.getCore().byId(this.oController.sImportPageMessageStripId);
			if (oMs) {
				oMs.destroy();
			}
			this.oController.oUIModel.setProperty("/uploadJobName", "");
			this.oController.byId("importFileNameImport").setValueState("None");
			this.oController.byId("importFileNameImport").setValueStateText("");
			this.oController.oImportDataModel.setProperty("/salesItemData", []);
			this.oController.oImportDataModel.setProperty("/salesHeaderData", []);
			//set control to initial state
			this.oController.ImportButton.setEnabled(false);
			this.oController.oUploadCollection.removeAllItems();
			this.oController.oUploadCollection.setVisible(true);
			this.oController.oPreviewTable.setVisible(false);
			//set page to initial state
			this.oController.backToMasterPage();
		},

		clearTable: function () {
			this.oController.oPreviewTable.destroyColumns();
			this.oController.oColumnListItem.destroyCells();
		},

		_adjustFieldTextFormatter: function (sDisplayFormat, aPrice, sName, that) {
			var oTextFormatter = that.formatter.setFiledText;
			if (sDisplayFormat === "Date") {
				oTextFormatter = that.formatter.setDateFiledText;
			}

			// check whether field is for pricing field, if true and it's ratio, then change the fomarter
			// to concatenate the %.
			if (aPrice && sName.match(/^HEADER_PRICE.*/) !== null) {
				var aItemPriceInfo = sName.split("__");
				if (aItemPriceInfo.length > 0) {
					var sCondTypeFromHead = aItemPriceInfo[1]; // Condition Type
					var sCondFieldName = aItemPriceInfo[2]; // Field Name
					sCondFieldName = sCondFieldName.toUpperCase();
					for (var index1 in aPrice) {
						if (sCondTypeFromHead && sCondFieldName && aPrice[index1].PROPERTY &&
							aPrice[index1].SUBGROUPNAME === sCondTypeFromHead && sCondFieldName === "CONDITIONRATEVALUE") {
							var sCondType = aPrice[index1].PROPERTY;
							if (sCondType && sCondType === "RATIO") {
								oTextFormatter = that.formatter.formatRatio;
							}
						}
					}
				}
			}
			return oTextFormatter;
		},

		// Build Preview Table
		buildPreviewTable: function (aSettingHeaderFields, aSettingVisibleFields) {
			this.clearTable();
			var oUploadedFiledList = this.oController.oUIModel.getProperty("/uploadedFiledList");
			var aFields = this.oController.oUIModel.getProperty(this.sFieldPath);
			if (aSettingHeaderFields !== undefined) {
				aFields = aSettingHeaderFields;
			}

			var aPrice = this.oController.oUIModel.getProperty(this.sPriceField);
			var index, oColumn, oCell, oProperty;
			// sTextPath;
			var that = this.oController;
			for (index in aFields) {
				var sName = aFields[index];
				var bVisible = true;
				var sImportance = "Low";
				//var sWidth = "auto";
				var sHAlign = "Begin";

				if (aSettingVisibleFields !== undefined) {
					bVisible = (aSettingVisibleFields.indexOf(sName) >= 0);
				}

				// Create Cell
				if (sName === this.sTextName) {
					var sLabel = this.oController.oResourceBundle.getText("TEXT_OBEJCT_COLUMN_TITLE");
					var sQuickInfo = this.oController.oResourceBundle.getText("TEXT_OBEJCT_COLUMN_TITLE");
					sQuickInfo = sQuickInfo ? sQuickInfo : sLabel;

					// Create Column
					oColumn = this.createColumn(bVisible, sHAlign, sImportance, sLabel, sQuickInfo);
					this.oController.oPreviewTable.addColumn(oColumn);

					// Text Cells in preview table
					oCell = new ObjectStatus({
						active: {
							path: this.oController.sDataModelRootPath + this.sTextPath,
							formatter: that.formatter.setActiveForText
						},
						icon: {
							path: this.oController.sDataModelRootPath + this.sTextPath,
							formatter: that.formatter.setIconForText
						},
						state: {
							path: this.oController.sDataModelRootPath + this.sTextPath,
							formatter: that.formatter.setStatusForText
						},
						tooltip: this.oController.oResourceBundle.getText("TEXT_OBEJCT_COLUMN_TITLE")
					});

					oCell.attachPress(function (oEvent) {
						that.utility.handleTextCellPress(oEvent, this.sMode);
					});
				} else {
					var sType = "String";
					var sDisplayFormat = "";
					if (sName.indexOf("__") >= 0) {
						var sGroupName = sName.split("__")[0];
						var sSubGroupName = sName.split("__")[1];
						var sFieldName = sName.split("__")[2];
						oProperty = this.oController.oFiledList[sFieldName];
						for (var indexField in oUploadedFiledList) {
							if (oUploadedFiledList[indexField].FIELDNAME === sFieldName && oUploadedFiledList[indexField]
								.SUBGROUPNAME ===
								sSubGroupName && oUploadedFiledList[indexField].GROUP === sGroupName) {
								//oProperty["sap:label"] = this.oController.oUploadedFiledList[indexField].SAPLABEL;
								sLabel = oUploadedFiledList[indexField].SAPLABEL;
								break;
							}
						}
					} else {
						oProperty = this.oController.oFiledList[sName];
						sLabel = oProperty ? oProperty["sap:label"] : sName;
						if (sName === this.oController.sKeyField) {
							sImportance = 'High';
						}
					}

					if (!oProperty) {
						continue;
					}

					sType = oProperty["type"];
					sDisplayFormat = oProperty["sap:display-format"];
					sQuickInfo = oProperty["sap:quickinfo"] ? oProperty["sap:quickinfo"] : sLabel;

					if (sDisplayFormat !== "Date") {
						sHAlign = sType && sType.indexOf("Decimal") >= 0 ? "End" : "Begin";
					} else {
						sHAlign = "End";
					}
					// Create Column
					oColumn = this.createColumn(bVisible, sHAlign, sImportance, sLabel, sQuickInfo);
					this.oController.oPreviewTable.addColumn(oColumn);

					// Cells in preview table
					var oTextFormatter = this._adjustFieldTextFormatter(sDisplayFormat, aPrice, sName, that);
					oCell = new ObjectStatus({
						text: {
							path: this.oController.sDataModelRootPath + sName,
							formatter: oTextFormatter
						},
						icon: {
							path: this.oController.sDataModelRootPath + sName,
							formatter: that.formatter.setIcon
						},
						state: {
							path: this.oController.sDataModelRootPath + sName,
							formatter: that.formatter.setState
						}
					});
				}
				this.oController.oColumnListItem.addCell(oCell);
				bVisible = sHAlign = sImportance = sLabel = sQuickInfo = undefined;
			}
			return this.oController.oColumnListItem;
		},

		// Create Column for preview table
		createColumn: function (bVisible, sHAlign, sImportance, sLabel, sQuickInfo) {
			return new Column({
				width: "auto",
				//minScreenWidth: "Tablet",
				demandPopin: true,
				visible: bVisible,
				hAlign: sHAlign,
				importance: sImportance,
				popinDisplay: "Inline",
				header: new Label({
					text: sLabel,
					wrapping: true,
					tooltip: sQuickInfo
				})
			});
		},

		_handleTextTypeSelectChange: function (oEvent) {
			var oContents = oEvent.getSource().getParent().getContent();
			var oLanguagKeySelect = oContents[3];
			var oTextContent = oContents[5];

			var selection = oEvent.getSource();
			var selectedKey = selection.getSelectedKey();
			var selectedTextType = this.oTextJson[selectedKey].LongTextID;
			// set default key
			oLanguagKeySelect.removeAllItems();
			// insert current textID's languages
			var initialKey;
			for (var i = 0; i < this.oTextJson.length; i++) {
				if (this.oTextJson[i].LongTextID === selectedTextType) {
					oLanguagKeySelect.addItem(new Item({
						key: i,
						text: this.oTextJson[i].Language
					}));
					if (!initialKey) {
						initialKey = i;
					}
				}
			}
			// set default key
			oLanguagKeySelect.setSelectedKey(initialKey);
			oTextContent.setValue(this.oTextJson[initialKey].LongText);
		},

		_handleLanguageSelectChange: function (oEvent) {
			var oContents = oEvent.getSource().getParent().getContent();
			var oLanguagKeySelect = oContents[3];
			var oTextContent = oContents[5];

			var selectedKey = oLanguagKeySelect.getSelectedKey();
			oTextContent.setValue(this.oTextJson[selectedKey].LongText);
		},

		_setTextSelectLogic: function (oPopover, sMode) {
			var oContents = oPopover.getContent()[0].getContent();
			var oTextTypeSelect = oContents[1];
			var oLanguagKeySelect = oContents[3];
			var oTextContent = oContents[5];

			oTextTypeSelect.removeAllItems();
			oLanguagKeySelect.removeAllItems();
			oTextContent.setValue("");

			var oTextDesc = this.oController.oUIModel.getProperty(this.sTextDescPath);

			var aUniqueTextType = [];
			for (var i = 0; i < this.oTextJson.length; i++) {
				var sLongTextID = this.oTextJson[i].LongTextID;
				if (aUniqueTextType.indexOf(sLongTextID) === -1) {
					var sDescription = oTextDesc[this.oTextJson[i].LongTextID];
					if (sDescription) {
						sDescription = sDescription + " " + "(" + sLongTextID + ")";
						aUniqueTextType.push(sLongTextID);
						oTextTypeSelect.addItem(new Item({
							key: i,
							text: sDescription
						}));
					} else {
						aUniqueTextType.push(sLongTextID);
						oTextTypeSelect.addItem(new Item({
							key: i,
							text: sLongTextID
						}));
					}
				}
			}
			// insert first LongTextID's languages
			for (i = 0; i < this.oTextJson.length; i++) {
				if (this.oTextJson[i].LongTextID === this.oTextJson[0].LongTextID) {
					oLanguagKeySelect.addItem(new Item({
						key: i,
						text: this.oTextJson[i].Language
					}));
				}
			}
			// set default key
			oTextTypeSelect.setSelectedKey(0);
			oLanguagKeySelect.setSelectedKey(0);
			oTextContent.setValue(this.oTextJson[0].LongText);

			oTextTypeSelect.attachChange(this._handleTextTypeSelectChange, this);
			// set handle function when oLanguagKeySelect change
			oLanguagKeySelect.attachChange(this._handleLanguageSelectChange, this);
		},

		handleTextCellPress: function (oEvent) {
			var that = this;		
			if(!this.bReupload){
				var item = oEvent.getSource().getParent().getBindingContextPath("importSalesOrder");
			}else{
				item = oEvent.getSource().getParent().getBindingContextPath("reuploadSalesDoc");
			}
			var oView = this.oController.oPreviewView;
			var oTextIcon = oEvent.getSource();
			var oModel = this.oController.oImportDataModel.getProperty(this.sDataPath);
			var itemIndex = item.split("/")[2];
			this.oTextJson = oModel[itemIndex][this.sTextPath];

			if (!this.oController._pTextPopover) {
				this.oController._pTextPopover = Fragment.load({
					id: this.sTextPopoverId,
					name: "cus.sd.salesorder.imports1.view.fragment.TextObjectPopover",
					controller: this.oController
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this.oController._pTextPopover.then(function (oPopover) {
				that._setTextSelectLogic(oPopover, that.sMode);
				oPopover.openBy(oTextIcon);
			});
		},

		/** data process methods
		 * following methods are processing data and store to related application models
		 **/
		//store parsed upload data in Json format which will be used onImport
		processReturnData: function (oUploadData, bReupload) {
			var sUploadName = this.oController.oUIModel.getProperty("/uploadJobName");
			if (!this.bReupload) {
				//Import
				this.oController.FileNameImport.setValue(sUploadName);
				this.oController.onImportNameChange();
			} else {
				//Reupload
			}
			this.storeUploadData(oUploadData);
			this.oController.buildTable();
			this.processP13nData(oUploadData.to_ImportHistItem);
			this.processUploadData(oUploadData.to_ImportHistItem);
			this.hideTableDetail();
		},

		storeUploadData: function (oUploadData) {
			// Delete invalide field eg "HIGHLIGHT" for import
			this.oController.oUploadData = deepExtend({}, oUploadData);
			var aImportHistoryItem = this.oController.oUploadData.to_ImportHistItem;
			var aItems = [];
			var oOrder = {};
			var oItem = {};
			if (aImportHistoryItem.length > 0) {
				for (var i in aImportHistoryItem) {
					oOrder = aImportHistoryItem[i].to_SalesOrder ? aImportHistoryItem[i].to_SalesOrder : aImportHistoryItem[i].to_SalesDocumentImport;
					delete oOrder["HIGHLIGHT"];
					if (aImportHistoryItem[i].to_SalesOrder !== undefined) {
						aItems = aImportHistoryItem[i].to_SalesOrder.to_Item;
					} else if (aImportHistoryItem[i].to_SalesDocumentImport !== undefined) {
						aItems = aImportHistoryItem[i].to_SalesDocumentImport.to_Item;
					}
					for (var j in aItems) {
						oItem = aItems[j];
						delete oItem["ProductStandardID"];
						delete oItem["HIGHLIGHT"];
					}
				}
			}
			if (this.oController.oReuploadDataModel !== undefined) {
				this.oController.oReuploadDataModel.setProperty("/reuploadData", deepExtend({}, this.oController.oUploadData));
			}
		},

		processFieldList: function (aFieldList) {
			if (aFieldList && aFieldList.length > 0) {
				var sUploadFields = aFieldList[0].textContent;
				try {
					var oUploadField = JSON.parse(sUploadFields);
				} catch (err) {
					return;
				}

				var firstHeaderText = 0;
				var firstItemText = 0;
				var arrLen = oUploadField.UPLOADFIELDS.length;
				var deleteArr = [];

				for (var i = 0; i < arrLen; i++) {
					if (oUploadField.UPLOADFIELDS[i].GROUP === "HEADER_TEXT") {
						if (firstHeaderText === 0) {
							oUploadField.UPLOADFIELDS[i].SUBGROUPNAME = "";
							oUploadField.UPLOADFIELDS[i].FIELDNAME = "TEXT";
							oUploadField.UPLOADFIELDS[i].LABEL = "TEXT";
							oUploadField.UPLOADFIELDS[i].SAPLABEL = "TEXT";

							firstHeaderText = 1;
						} else {
							deleteArr.push(i);
						}
					}

					if (oUploadField.UPLOADFIELDS[i].GROUP === "ITEM_TEXT") {
						if (firstItemText === 0) {
							oUploadField.UPLOADFIELDS[i].SUBGROUPNAME = "";
							oUploadField.UPLOADFIELDS[i].FIELDNAME = "TEXT";
							oUploadField.UPLOADFIELDS[i].LABEL = "TEXT";
							oUploadField.UPLOADFIELDS[i].SAPLABEL = "TEXT";

							firstItemText = 1;
						} else {
							deleteArr.push(i);
						}
					}
				}

				for (var j = deleteArr.length - 1; j >= 0; j--) {
					oUploadField.UPLOADFIELDS.splice(deleteArr[j], 1);
				}

				if (oUploadField !== undefined && oUploadField !== null && oUploadField !== "") {
					if (oUploadField.UPLOADFIELDS !== undefined) {
						var aFields = oUploadField.UPLOADFIELDS;
						//Uploaded Field list contains label in Excel, save this information for building table
						this.oController.oUploadedFiledList = aFields;
						this.oController.oUIModel.setProperty("/uploadedFiledList", aFields);

						var aHeaderFields = [];
						var aItemFields = [];
						var aPricingElements = [];
						var aItemPricingElements = [];
						var sAssociationFieldName = ""; //Because we only have 2 level(header and item), we need add the association(text,condition) fields to header and item level
						for (var index in aFields) {
							switch (aFields[index].GROUP) {
							case "HEADER":
								aHeaderFields.push(aFields[index].FIELDNAME);
								break;
							case "ITEM":
								aItemFields.push(aFields[index].FIELDNAME);
								break;
							case "HEADER_PRICE": //e.g.: sAssociationFieldName = 'HEADER_PRICE__PR00__ConditionRateValue'
								sAssociationFieldName = aFields[index].GROUP + "__" + aFields[index].SUBGROUPNAME + "__" + aFields[index].FIELDNAME;
								aHeaderFields.push(sAssociationFieldName);
								aPricingElements.push(sAssociationFieldName);
								break;
							case "ITEM_PRICE": //e.g.: sAssociationFieldName = 'ITEM_PRICE__PR00__ConditionRateValue'
								sAssociationFieldName = aFields[index].GROUP + "__" + aFields[index].SUBGROUPNAME + "__" + aFields[index].FIELDNAME;
								aItemFields.push(sAssociationFieldName);
								aItemPricingElements.push(sAssociationFieldName);
								break;
							case "HEADER_TEXT":
								aHeaderFields.push("HEADER_TEXT");
								break;
							case "ITEM_TEXT":
								aItemFields.push("ITEM_TEXT");
								break;
							}
						}
						this.oController.oUIModel.setProperty("/headerFields", aHeaderFields);
						this.oController.oUIModel.setProperty("/itemFields", aItemFields);
						this.oController.oUIModel.setProperty("/pricingElements", aPricingElements);
						this.oController.oUIModel.setProperty("/itemPricingElements", aItemPricingElements);
					}
				}
			}
		},

		splitFieldList: function (aFieldList) {
			// get text key and description and store in model 
			if (aFieldList && aFieldList.length > 0) {
				var sUploadFields = aFieldList[0].textContent;
				try {
					var oUploadField = JSON.parse(sUploadFields);
				} catch (err) {
					return;
				}
				var arrLen = oUploadField.UPLOADFIELDS.length;
				var oHeaderTextDesc = {};
				var oItemTextDesc = {};
				var aHeaderPrice = [];
				var aItemPrice = [];

				for (var i = 0; i < arrLen; i++) {

					if (oUploadField.UPLOADFIELDS[i].GROUP === "HEADER_TEXT") {
						oHeaderTextDesc[oUploadField.UPLOADFIELDS[i].SUBGROUPNAME] = oUploadField.UPLOADFIELDS[i].SAPLABEL;
					} else if (oUploadField.UPLOADFIELDS[i].GROUP === "ITEM_TEXT") {
						oItemTextDesc[oUploadField.UPLOADFIELDS[i].SUBGROUPNAME] = oUploadField.UPLOADFIELDS[i].SAPLABEL;
					} else if (oUploadField.UPLOADFIELDS[i].GROUP === "HEADER_PRICE") {
						//oHeaderPrice[oUploadField.UPLOADFIELDS[i].SUBGROUPNAME] = oUploadField.UPLOADFIELDS[i]; 
						aHeaderPrice.push(oUploadField.UPLOADFIELDS[i]);
					} else if (oUploadField.UPLOADFIELDS[i].GROUP === "ITEM_PRICE") {
						//	oItemPrice[oUploadField.UPLOADFIELDS[i].SUBGROUPNAME] = oUploadField.UPLOADFIELDS[i]; 
						aItemPrice.push(oUploadField.UPLOADFIELDS[i]);
					}
				}
				this.oController.oUIModel.setProperty("/headerTextDesc", oHeaderTextDesc);
				this.oController.oUIModel.setProperty("/itemTextDesc", oItemTextDesc);
				this.oController.oUIModel.setProperty("/headerPrice", aHeaderPrice);
				this.oController.oUIModel.setProperty("/itemPrice", aItemPrice);
			}
		},

		processP13nData: function (aImportItems) {
			var aHeaderFields = this.oController.oUIModel.getProperty("/headerFields");
			var aItemFields = this.oController.oUIModel.getProperty("/itemFields");
			var sName = "";
			var bVisible = true;
			var oProperty = {};
			var sLabel = "";

			// Build JSONModel for setting button(header) 
			this.oController.oP13nColumns.headerColumns = [];
			this.oController.oP13nColumns.headerRuntimeColumns = [];
			for (var indexHeader in aHeaderFields) {
				sName = aHeaderFields[indexHeader];
				if (sName === "HEADER_TEXT") {
					var sGroupName = sName;
					var sSubGroupName = "";
					var sFieldName = "Text";
					sLabel = this.oController.oResourceBundle.getText("TEXT_OBEJCT_COLUMN_TITLE");

					var oHeaderColumn = {};
					oHeaderColumn.columnKey = sName;
					oHeaderColumn.text = sLabel;
					this.oController.oP13nColumns.headerColumns.push(oHeaderColumn);

					var oHeaderRuntimeColumn = {};
					oHeaderRuntimeColumn.columnKey = sName;
					oHeaderRuntimeColumn.visible = bVisible;
					this.oController.oP13nColumns.headerRuntimeColumns.push(oHeaderRuntimeColumn);
				} else {
					if (sName.indexOf("__") >= 0) {
						sGroupName = sName.split("__")[0];
						sSubGroupName = sName.split("__")[1];
						sFieldName = sName.split("__")[2];
						//bVisible = (aDefaultFields.indexOf(sName) >= 0);
						oProperty = this.oController.oFiledList[sFieldName];
						for (var indexField in this.oController.oUploadedFiledList) {
							if (this.oController.oUploadedFiledList[indexField].FIELDNAME === sFieldName && this.oController.oUploadedFiledList[indexField]
								.SUBGROUPNAME ===
								sSubGroupName && this.oController.oUploadedFiledList[indexField].GROUP === sGroupName) {
								oProperty["sap:label"] = this.oController.oUploadedFiledList[indexField].SAPLABEL;
								break;
							}
						}
					} else {
						//bVisible = (aDefaultFields.indexOf(sName) >= 0);
						oProperty = this.oController.oFiledList[sName];
					}

					sLabel = oProperty["sap:label"];

					oHeaderColumn = {};
					oHeaderColumn.columnKey = sName;
					oHeaderColumn.text = sLabel;
					this.oController.oP13nColumns.headerColumns.push(oHeaderColumn);

					oHeaderRuntimeColumn = {};
					oHeaderRuntimeColumn.columnKey = sName;
					oHeaderRuntimeColumn.visible = bVisible;
					this.oController.oP13nColumns.headerRuntimeColumns.push(oHeaderRuntimeColumn);
				}
			}
			this.oController.oP13nModel.setProperty("/headerColumns", this.oController.oP13nColumns.headerColumns);
			this.oController.oP13nModel.setProperty("/headerRuntimeColumns", deepExtend([], this.oController.oP13nColumns.headerRuntimeColumns));

			// Build JSONModel for setting button(item)
			// Get all items data
			var oItemsData = this.getAllItemsData(aImportItems);
			this.oController.oP13nColumns.itemColumns = [];
			this.oController.oP13nColumns.itemRuntimeColumns = [];
			for (var indexItem in aItemFields) {
				sName = aItemFields[indexItem];
				bVisible = true;

				if (sName === "ITEM_TEXT") {
					var sItemGroupName = sName;
					var sItemSubGroupName = "";
					var sItemFieldName = "Text";
					//bVisible = (aDefaultFields.indexOf(sName) >= 0);
					sLabel = this.oController.oResourceBundle.getText("TEXT_OBEJCT_COLUMN_TITLE");

					var oItemColumn = {};
					oItemColumn.columnKey = sName;
					oItemColumn.text = sLabel;
					this.oController.oP13nColumns.itemColumns.push(oItemColumn);

					var oItemRuntimeColumn = {};
					oItemRuntimeColumn.columnKey = sName;
					oItemRuntimeColumn.visible = bVisible;
					this.oController.oP13nColumns.itemRuntimeColumns.push(oItemRuntimeColumn);
				} else {
					if (sName.indexOf("__") >= 0) {
						sItemGroupName = sName.split("__")[0];
						sItemSubGroupName = sName.split("__")[1];
						sItemFieldName = sName.split("__")[2];
						//bVisible = (aDefaultFields.indexOf(sName) >= 0);
						oProperty = this.oController.oFiledList[sItemFieldName];
						for (var indexItemField in this.oController.oUploadedFiledList) {
							if (this.oController.oUploadedFiledList[indexItemField].FIELDNAME === sItemFieldName && this.oController.oUploadedFiledList[
									indexItemField].SUBGROUPNAME ===
								sItemSubGroupName && this.oController.oUploadedFiledList[indexItemField].GROUP === sItemGroupName) {
								oProperty["sap:label"] = this.oController.oUploadedFiledList[indexItemField].SAPLABEL;
								break;
							}
						}
					} else {
						// If value of MaterialByCustomer or ProductStandardID is not initial in items data, need to set them in item preview table by default.  
						switch (sName) {
						case "MaterialByCustomer":
							bVisible = this.detectMaterialByCustomer(oItemsData);
							oProperty = this.oController.oFiledList[sName];
							break;
						case "ProductStandardID":
							bVisible = this.detectProductStandardID(oItemsData);
							oProperty = this.oController.oFiledList[sName];
							break;
						default:
							oProperty = this.oController.oFiledList[sName];
						}
					}
					sLabel = oProperty["sap:label"];

					oItemColumn = {};
					oItemColumn.columnKey = sName;
					oItemColumn.text = sLabel;
					oItemColumn.index = indexItem;
					this.oController.oP13nColumns.itemColumns.push(oItemColumn);

					oItemRuntimeColumn = {};
					oItemRuntimeColumn.columnKey = sName;
					oItemRuntimeColumn.visible = bVisible;
					this.oController.oP13nColumns.itemRuntimeColumns.push(oItemRuntimeColumn);
				}
			}
			this.oController.oP13nModel.setProperty("/itemColumns", this.oController.oP13nColumns.itemColumns);
			this.oController.oP13nModel.setProperty("/itemRuntimeColumns", deepExtend([], this.oController.oP13nColumns.itemRuntimeColumns));
		},

		getAllItemsData: function (aImportItems) {
			var oItemsData = [];
			for (var index in aImportItems) {
				if (aImportItems[index].to_SalesOrder !== undefined) {
					for (var indexItem in aImportItems[index].to_SalesOrder.to_Item) {
						oItemsData.push(aImportItems[index].to_SalesOrder.to_Item[indexItem]);
					}
				} else {
					for (var indexItem1 in aImportItems[index].to_SalesDocumentImport.to_Item) {
						oItemsData.push(aImportItems[index].to_SalesDocumentImport.to_Item[indexItem1]);
					}
				}
			}
			return oItemsData;
		},

		detectMaterialByCustomer: function (aItemsData) {
			for (var index in aItemsData) {
				if (aItemsData[index].MaterialByCustomer !== null & aItemsData[index].MaterialByCustomer !== undefined) {
					return true;
				}
			}
			return false;
		},

		detectProductStandardID: function (aItemsData) {
			for (var index in aItemsData) {
				if (aItemsData[index].ProductStandardID !== null & aItemsData[index].ProductStandardID !== undefined) {
					return true;
				}
			}
			return false;
		},

		processUploadData: function (aImportItems) {
			if (!aImportItems || aImportItems.length <= 0) {
				var sNoSalesOrderReturn = this.oController.oResourceBundle.getText("MSG_NO_SALES_ORDER");
				MessageBox.error(sNoSalesOrderReturn);
				return;
			}
			// Prepare Sales Order List
			var aSalesOrder = [];
			for (var i in aImportItems) {
				if (aImportItems[i].to_SalesOrder !== undefined) {
					aImportItems[i].to_SalesOrder["SalesDocumentTemporaryID"] = aImportItems[i].SalesDocumentTemporaryID;
					aSalesOrder.push(aImportItems[i].to_SalesOrder);
				} else if (aImportItems[i].to_SalesDocumentImport !== undefined) {
					aImportItems[i].to_SalesDocumentImport["SalesDocumentTemporaryID"] = aImportItems[i].SalesDocumentTemporaryID;
					aSalesOrder.push(aImportItems[i].to_SalesDocumentImport);
				}
			}

			//Get PrincingElement field list
			var aPricingElements = this.oController.oUIModel.getProperty("/pricingElements");
			var aItemPricingElements = this.oController.oUIModel.getProperty("/itemPricingElements");

			//1. Get overall highlight status
			//2. Map partner function to header level
			//3. Process text and pricing data
			if (aSalesOrder.length > 0) {
				var sMessageType = MessageType.Success;
				for (var index in aSalesOrder) {
					var sStatus = this.getStatus(aSalesOrder[index]);
					//get status according to header and item upload status
					aSalesOrder[index].HIGHLIGHT = sStatus;
					var bUploadWithError = false;
					if (bUploadWithError === false) {
						if (sStatus === "Error") {
							bUploadWithError = true;
						} else if (sMessageType === MessageType.Success && sStatus === "Warning") {
							sMessageType = MessageType.Warning;
						}
					}

					//get partner function fields, add to header level
					if (aSalesOrder[index].to_Partner && aSalesOrder[index].to_Partner.length > 0) {
						var aPartners = aSalesOrder[index].to_Partner;
						this.processPartnerData(aPartners, aSalesOrder[index]);
					}

					// Add pricing fields from to_PricingElement to header
					if (aSalesOrder[index].to_PricingElement !== undefined && aSalesOrder[index].to_PricingElement.length > 0) {
						var aPricingElementValue = aSalesOrder[index].to_PricingElement;
						this.processPricingData(aPricingElementValue, aPricingElements, aSalesOrder[index]);
					}

					for (var itemIndex in aSalesOrder[index].to_Item) {
						// Add requesteddeliverydate from to_scheduleline to item level
						var aScheduleLine = aSalesOrder[index].to_Item[itemIndex].to_ScheduleLine;
						if (aScheduleLine !== undefined && aScheduleLine.length > 0) {
							var reqdeliverydate = aScheduleLine[0].RequestedDeliveryDate;
							aSalesOrder[index].to_Item[itemIndex].RequestedDeliveryDate = reqdeliverydate;
						}

						//get partner function fields, add to item level
						if (aSalesOrder[index].to_Item[itemIndex].to_Partner && aSalesOrder[index].to_Item[itemIndex].to_Partner.length > 0) {
							var aItemPartners = aSalesOrder[index].to_Item[itemIndex].to_Partner;
							this.processPartnerData(aItemPartners, aSalesOrder[index].to_Item[itemIndex], aSalesOrder[index]);
						}

						// Add pricing fields from to_PricingElement to item level
						if (aSalesOrder[index].to_Item[itemIndex].to_PricingElement !== undefined && aSalesOrder[index].to_Item[itemIndex].to_PricingElement
							.length > 0) {
							var aItemPricingElementValue = aSalesOrder[index].to_Item[itemIndex].to_PricingElement;
							this.processPricingData(aItemPricingElementValue, aItemPricingElements, aSalesOrder[index].to_Item[itemIndex], aSalesOrder[
								index]);
						}
					}
				}

				//1. Get overall highlight status
				this.oController.oUIModel.setProperty("/messageVisibility", true);
				//Store processed data to application model
				this.oController.oImportDataModel.setProperty("/salesHeaderData", aSalesOrder);

				this._showPreviewTable();
				this.prepareForMessageStrip();
			}
		},

		processPartnerData: function (aPartners, oOrderData, oSaleDocNode) {
			for (var j in aPartners) {
				if (aPartners[j].PartnerFunction !== undefined && this.oController.oPartnerFunctions.hasOwnProperty(aPartners[j].PartnerFunction)) {
					var sFieldName = this.oController.oPartnerFunctions[aPartners[j].PartnerFunction];
					oOrderData[sFieldName] = aPartners[j].Customer;
				}
				// If partner has HIGHLIGHT, it must be error currently, so overwrite upper level HIGHLIGHT status directly.
				if (aPartners[j].HIGHLIGHT !== undefined) {
					//For header case, assgin HIGHLIGHT to sales doc level. For item case. assign HIGHLIGHT to sales item level
					oOrderData.HIGHLIGHT = "Error";
					if (oSaleDocNode) {
						//For item case, add HIGHLIGHT error to sales doc level
						oSaleDocNode.HIGHLIGHT = "Error";
					}
				}
			}
		},

		processPricingData: function (aPricing, aPricingFields, oOrderData, oSaleDocNode) {
			for (var pricingDataIndex in aPricing) {
				var sConditionType = aPricing[pricingDataIndex].ConditionType;
				for (var pricingFieldindex in aPricingFields) {
					var sPricingElementFullName = aPricingFields[pricingFieldindex];
					var sPricingElementConditionType = aPricingFields[pricingFieldindex].split("__")[1];
					var sPricingElementNetName = aPricingFields[pricingFieldindex].split("__")[2];
					if (sPricingElementConditionType === sConditionType) {
						oOrderData[sPricingElementFullName] = aPricing[pricingDataIndex][sPricingElementNetName];
					}
				}
				// If Price has HIGHLIGHT, it must be error currently, so overwrite upper level HIGHLIGHT status directly.
				if (aPricing[pricingDataIndex].HIGHLIGHT !== undefined) {
					//For header case, assgin HIGHLIGHT to sales doc level. For item case. assign HIGHLIGHT to sales item level
					oOrderData.HIGHLIGHT = "Error";
					if (oSaleDocNode) {
						//For item case, add HIGHLIGHT error to sales doc level
						oSaleDocNode.HIGHLIGHT = "Error";
					}
				}
			}
		},

		/* MessageStrip & MessageBox handling method */
		prepareForMessageStrip: function () {
			//Dynamic generate messagestrip due to accessbility check
			if(!this.bReupload){
				var sMessageSuccess = "MESSAGE_SUCCESS";
				var sMessageWarning = "MESSAGE_WARNING";
				var sMessageError   = "MESSAGE_ERROR";
			}else{
				sMessageSuccess = "REUPLOAD_MESSAGE_SUCCESS";
				sMessageWarning = "REUPLOAD_MESSAGE_WARNING";
				sMessageError   = "REUPLOAD_MESSAGE_ERROR";
			}
			var iMessageNum = this.oController.oMsgModel.getProperty("/messages").length;
			var aMessages = this.oController.oMsgModel.getProperty("/messages");
			var sType = MessageType.Success;
			var sText = this.oController.oResourceBundle.getText(sMessageSuccess);
			this.oController.ImportButton.setEnabled(true);
			var index = 0;
			for (index in aMessages) {
				if (aMessages[index].TYPE === MessageType.Warning) {
					sType = MessageType.Warning;
					sText = this.oController.oResourceBundle.getText(sMessageWarning, [iMessageNum]);
				}
				if (aMessages[index].TYPE === MessageType.Error) {
					sType = MessageType.Error;
					sText = this.oController.oResourceBundle.getText(sMessageError, [iMessageNum]);
					this.oController.ImportButton.setEnabled(false);
					break;
				}
			}
			var oMs = sap.ui.getCore().byId(this.oController.sImportPageMessageStripId);
			if (oMs) {
				oMs.destroy();
			}
			this._generateMsgStrip(sType, sText);
		},

		_generateMsgStrip: function (sType, sText) {
			if(!this.bReupload){
				var oVC = this.oController.byId("importPageVLayout1");
			}else{
				oVC = this.oController.byId("reuploadPageVLayout1");
			}
			this.oController.sMessageStripStatus = sType;
			var oMsgStrip = new MessageStrip(this.oController.sImportPageMessageStripId, {
				text: sText,
				showCloseButton: false,
				showIcon: true,
				type: sType
			});
			if (sType !== MessageType.Success) {
				oMsgStrip.setLink(new Link({
					text: this.oController.oResourceBundle.getText("MSG_STRIP_LINK")
				}).attachPress(this.handleShowMessagePress, this));
			}
			var sTypeText = "";

			switch (sType) {
			case MessageType.Information:
				sTypeText = this.oController.oResourceBundle.getText("INFORMATION");
				break;
			case MessageType.Success:
				sTypeText = this.oController.oResourceBundle.getText("SUCCESS");
				break;
			case MessageType.Warning:
				sTypeText = this.oController.oResourceBundle.getText("WARNING");
				break;
			case MessageType.Error:
				sTypeText = this.oController.oResourceBundle.getText("ERROR");
				break;
			default:
				sTypeText = "";
			}

			var oInvisibleMessage = InvisibleMessage.getInstance();
			oInvisibleMessage.announce(sTypeText + " " + sText, InvisibleMessageMode.Assertive);
			oVC.addContent(oMsgStrip);
		},

		handleShowMessagePress: function () {
			var oMessageTemplate = new sap.m.MessageItem({
				type: "{TYPE}",
				title: "{TITLE}",
				subtitle: "{SUBTITLE}",
				description: "{DESCRIPTION}"
			});

			var oMessageView = new sap.m.MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/messages",
					template: oMessageTemplate
				}
			});

			var oBackButton = new Button({
				icon: "sap-icon://nav-back",
				visible: false,
				press: function () {
					oMessageView.navigateBack();
					this.setVisible(false);
				}
			});

			var oMessageContent = [];
			oMessageContent = oMessageView;
			var sTitle = this.oController.oResourceBundle.getText("MSG_STRIP_WARNING_TITLE");
			var sState = "Warning";

			var aMessages = this.oController.oMsgModel.getProperty("/messages");
			for (var i = 0; i < this.oController.oMsgModel.getProperty("/messages").length; i++) {
				if (aMessages[i].TYPE === MessageType.Error) {
					sTitle = this.oController.oResourceBundle.getText("MSG_STRIP_ERROR_TITLE");
					sState = "Error";
					break;
				}
			}
			var oMessageDialog = new sap.m.Dialog({
				title: sTitle,
				state: sState,
				content: oMessageContent,
				customHeader: new sap.m.Bar({
					contentLeft: [
						oBackButton,
						new sap.m.Title({
							text: sTitle
						})
					]
				}),
				beginButton: new sap.m.Button({
					press: function () {
						oMessageDialog.close();
					},
					text: this.oController.oResourceBundle.getText("CLOSE")
				}),
				afterClose: function () {
					oMessageDialog.destroy();
					oMessageTemplate.destroy();
					oMessageView.destroy();
				},
				contentHeight: "440px",
				contentWidth: "640px",
				verticalScrolling: false,
				draggable: true,
				resizable: true
			});
			oMessageDialog.setModel(this.oController.oMsgModel);
			oMessageDialog.open();
		},

		setMessageDetailsView: function (aMessageDetails) {
			if (this.oController.oMsgModel.getProperty("/messages").length !== 0) {
				this.oController.oMsgModel.setProperty("/msgStripLinkText", this.oController.oResourceBundle.getText("MSG_STRIP_LINK"));
			} else {
				this.oController.oMsgModel.setProperty("/msgStripLinkText", "");
			}
		},

		parseMessageContent: function (aMessageDetails) {
			try {
				var aMessages = JSON.parse(aMessageDetails).MESSAGES;
			} catch (err) {
				this.oController.oMsgModel.setProperty("/messages", []);
				return;
			}
			this.oController.oMsgModel.setProperty("/messages", aMessages);
		},

		getStatus: function (oSalesOrder) {
			if (!oSalesOrder.hasOwnProperty('HIGHLIGHT')) {
				if (oSalesOrder.to_Item.length > 0) {
					for (var i in oSalesOrder.to_Item) {
						if (oSalesOrder.to_Item[i].hasOwnProperty('HIGHLIGHT')) {
							return oSalesOrder.to_Item[i].HIGHLIGHT;
						}
					}
				}
			} else {
				return oSalesOrder.HIGHLIGHT;
			}

			return "None";
		},

		/* table "Show Detail" and "Hide Detail" switch logic */
		showTableDetail: function () {
			this.oController.oDetailButton.setText(this.oController.oResourceBundle.getText("BUTTON_HIDE_DETAIL"));
			this.oController.oPreviewTable.setHiddenInPopin([]);
		},

		hideTableDetail: function () {
			this.oController.oDetailButton.setText(this.oController.oResourceBundle.getText("BUTTON_SHOW_DETAIL"));
			this.oController.oPreviewTable.setHiddenInPopin(["Low"]);
		},

		/* Other utility method */
		processNameByDate: function (sUploadName) {
			var oDate = new Date();

			var y = oDate.getFullYear();
			var m = oDate.getMonth() + 1;
			var d = oDate.getDate();

			var sTimeStamp = y + ":" + (m < 10 ? "0" + m : m) + ":" + (d < 10 ? "0" + d : d) + ":" + oDate.toTimeString().substr(0, 8);
			sTimeStamp = sTimeStamp.replace(/:/g, "");
			var sFileName = sUploadName.substring(0, sUploadName.lastIndexOf("."));

			var sName = sFileName + "_" + sTimeStamp;

			return sName.substr(0, 100);
		},

		processFileName: function (sFileName) {
			//remove filetype suffix and restrict length to 100
			if (sFileName) {
				var sUploadName = sFileName.substring(0, sFileName.lastIndexOf("."));
				return sUploadName.substr(0, 100);
			}

			return "";
		},
		
		isCorrectUpload: function(oEvent) {
			return oEvent.getParameter("id").indexOf("reupload") === -1? false: true;
		}
	});

});