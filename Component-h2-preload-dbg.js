//@ui5-bundle cus/sd/salesorder/imports1/Component-h2-preload.js
/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.predefine('cus/sd/salesorder/imports1/Component',["sap/ui/core/UIComponent","sap/ui/Device","sap/ui/model/json/JSONModel","./utils/models","sap/f/library"],function(U,D,J,m,f){"use strict";return U.extend("cus.sd.salesorder.imports1.Component",{metadata:{manifest:"json"},init:function(){U.prototype.init.apply(this,arguments);this.setModel(m.createODataModel(),"importSalesOrder");this.setModel(m.createUIModel(),"ui");this.setModel(m.createP13nModel(),"p13n");this.setModel(m.createMsgDialogModel(),"msgDialog");this.setModel(m.createODataModel(),"reuploadSalesDoc");this.setModel(m.createUIModel(),"reuploadUi");this.setModel(m.createP13nModel(),"reuploadP13n");this.setModel(m.createMsgDialogModel(),"reuploadMsgDialog");this.setModel(m.createSalesDocImportIDModel(),"reuploadSlsDocImprtID");this.setModel(m.createUploadDataForReuploadModel(),"reuploadData");this.setModel(m.createDocumentModel(),"document");var r;r=this.getRouter();r.attachBeforeRouteMatched(this._onBeforeRouteMatched,this);r.initialize();},_onBeforeRouteMatched:function(e){var M=this.getModel("ui"),l=e.getParameters().arguments.layout;var p=e.getParameter("name");if(!l){l=f.LayoutType.OneColumn;}M.setProperty("/layout",l);var r=this.getModel("i18n").getResourceBundle();var t;if(e.getParameter("name")==="ImportHistoryDetail"){t=r.getText("PAGE_IMPORT_DETAIL_TITLE");}else if(p==="history"||p==="historywithstate"){t=r.getText("PAGE_IMPORT_History");}else{if(l===f.LayoutType.MidColumnFullScreen){t=r.getText("PAGE_IMPORT_ITEM");}else{t=r.getText("appTitle");}}this.getService("ShellUIService").then(function(s){s.setTitle(t);},function(E){jQuery.sap.log.error("Cannot get ShellUIService",E,"my.app.Component");});}});});
sap.ui.require.preload({
	"cus/sd/salesorder/imports1/manifest.json":'{"_version":"1.12.0","sap.app":{"_version":"1.3.0","id":"cus.sd.salesorder.imports1","type":"application","i18n":"i18n/i18n.properties","title":"{{appTitle}}","description":"{{appTitle}}","applicationVersion":{"version":"10.0.4"},"ach":"SD-SLS-IMP-SPR","resources":"resources.json","dataSources":{"mainService":{"uri":"/sap/opu/odata/sap/SD_SALES_ORDER_IMPORT/","type":"OData","settings":{"odataVersion":"2.0","annotations":["SD_SALES_ORDER_IMPORT_ANNO_MDL","localAnnotations"],"localUri":"localService/metadata.xml"}},"SD_SALES_ORDER_IMPORT_ANNO_MDL":{"uri":"/sap/opu/odata/IWFND/CATALOGSERVICE;v=2/Annotations(TechnicalName=\'SD_SALES_ORDER_IMPORT_ANNO_MDL\',Version=\'0001\')/$value/","type":"ODataAnnotation","settings":{"localUri":"localService/SD_SALES_ORDER_IMPORT_ANNO_MDL.xml"}},"localAnnotations":{"type":"ODataAnnotation","uri":"annotations/annotation.xml","settings":{"localUri":"annotations/annotation.xml"}}}},"sap.fiori":{"registrationIds":["F4293"],"archeType":"transactional"},"sap.ui":{"technology":"UI5","icons":{"icon":"sap-icon://task","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":false}},"sap.ui5":{"rootView":{"id":"ImportSOApp","viewName":"cus.sd.salesorder.imports1.view.App","type":"XML","async":true},"dependencies":{"minUI5Version":"1.102.4","libs":{"sap.ui.core":{},"sap.m":{},"sap.f":{"lazy":true},"sap.ushell":{"lazy":true},"sap.ui.layout":{"lazy":true},"sap.ui.table":{"lazy":true},"sap.ui.unified":{"lazy":true},"sap.collaboration":{"lazy":true},"sap.ui.comp":{"lazy":true},"sap.ui.generic.app":{"lazy":true},"sap.uxap":{"lazy":true},"sap.fe.placeholder":{"lazy":false},"sap.nw.core.applogs.lib.reuse":{"minVersion":"1.17.0","lazy":false},"sap.s4h.cfnd.featuretoggle":{"minVersion":"23.0.0-SNAPSHOT","lazy":false}}},"componentUsages":{"ApplicationLogs":{"name":"sap.nw.core.applogs.lib.reuse.applogs","lazy":false}},"config":{"fullWidth":true},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"cus.sd.salesorder.imports1.i18n.i18n"}},"":{"dataSource":"mainService","preload":true,"settings":{"sap-value-list":"none"}},"@i18n":{"type":"sap.ui.model.resource.ResourceModel","uri":"i18n/i18n.properties"}},"resources":{"css":[{"uri":"css/style.css"}]},"services":{"ShellUIService":{"factoryName":"sap.ushell.ui5service.ShellUIService"}},"routing":{"config":{"routerClass":"sap.f.routing.Router","viewType":"XML","viewPath":"cus.sd.salesorder.imports1.view","controlId":"flexibleColumnLayout","transition":"slide","async":true},"routes":[{"pattern":"ImportHistory/AllImport","name":"history","target":"history","layout":"OneColumn"},{"pattern":"ImportHistory/AllImport{?query}","name":"historywithstate","target":"history","layout":"OneColumn"},{"pattern":"ImportHistoryDetail/{entity}","name":"ImportHistoryDetail","target":"historyDetail","layout":"OneColumn"},{"pattern":"ImportHistoryDetail/{entity}{?query}","name":"ImportHistoryDetailWithState","target":"historyDetail","layout":"OneColumn"},{"pattern":":layout:","name":"master","target":["master","previewItem"]},{"pattern":"Item/{layout}","name":"detail","target":["master","previewItem"]}],"targets":{"master":{"viewName":"Import","viewId":"ImportView","controlAggregation":"beginColumnPages"},"previewItem":{"viewName":"Item","viewId":"ImportItemView","controlAggregation":"midColumnPages"},"history":{"viewName":"ImportHistory","viewId":"ImportHistoryView","controlAggregation":"beginColumnPages","placeholder":{"html":"sap/fe/placeholder/view/PlaceholderLR.fragment.html","autoClose":false}},"historyDetail":{"viewName":"ImportHistoryDetail","viewId":"HistoryDetailView","controlAggregation":"beginColumnPages","placeholder":{"html":"sap/fe/placeholder/view/PlaceholderOP.fragment.html","autoClose":false}}}}}}'
},"cus/sd/salesorder/imports1/Component-h2-preload"
);
sap.ui.loader.config({depCacheUI5:{
"cus/sd/salesorder/imports1/Component.js":["cus/sd/salesorder/imports1/utils/models.js","sap/f/library.js","sap/ui/Device.js","sap/ui/core/UIComponent.js","sap/ui/model/json/JSONModel.js"],
"cus/sd/salesorder/imports1/controller/App.controller.js":["sap/ui/core/mvc/Controller.js","sap/ui/model/json/JSONModel.js"],
"cus/sd/salesorder/imports1/controller/Import.controller.js":["cus/sd/salesorder/imports1/utils/commonEventHandler.js","cus/sd/salesorder/imports1/utils/formatter.js","cus/sd/salesorder/imports1/utils/utility.js","sap/base/util/deepExtend.js","sap/f/library.js","sap/m/Button.js","sap/m/Link.js","sap/m/MessageBox.js","sap/m/MessageStrip.js","sap/m/ObjectStatus.js","sap/m/ResponsivePopover.js","sap/ui/core/Fragment.js","sap/ui/core/Item.js","sap/ui/core/MessageType.js","sap/ui/core/mvc/Controller.js","sap/ui/model/json/JSONModel.js","sap/ui/table/Column.js","sap/ui/unified/Currency.js"],
"cus/sd/salesorder/imports1/controller/ImportHistory.controller.js":["cus/sd/salesorder/imports1/utils/CONSTANTS.js","cus/sd/salesorder/imports1/utils/customUIFactory.js","cus/sd/salesorder/imports1/utils/formatter.js","sap/f/library.js","sap/m/MessageBox.js","sap/m/MessageToast.js","sap/ui/comp/state/UIState.js","sap/ui/core/mvc/Controller.js","sap/ui/generic/app/navigation/service/NavigationHandler.js","sap/ui/generic/app/navigation/service/SelectionVariant.js","sap/ui/model/odata/v2/ODataModel.js"],
"cus/sd/salesorder/imports1/controller/ImportHistoryDetail.controller.js":["cus/sd/salesorder/imports1/utils/CONSTANTS.js","cus/sd/salesorder/imports1/utils/commonEventHandler.js","cus/sd/salesorder/imports1/utils/customUIFactory.js","cus/sd/salesorder/imports1/utils/formatter.js","cus/sd/salesorder/imports1/utils/utility.js","sap/f/library.js","sap/m/Link.js","sap/m/MessageBox.js","sap/m/MessageStrip.js","sap/ui/core/Fragment.js","sap/ui/core/InvisibleMessage.js","sap/ui/core/Item.js","sap/ui/core/MessageType.js","sap/ui/core/library.js","sap/ui/core/mvc/Controller.js","sap/ui/generic/app/navigation/service/NavigationHandler.js","sap/ui/model/Filter.js","sap/ui/model/FilterOperator.js","sap/ui/model/odata/v2/ODataModel.js"],
"cus/sd/salesorder/imports1/controller/Item.controller.js":["cus/sd/salesorder/imports1/utils/commonEventHandler.js","cus/sd/salesorder/imports1/utils/formatter.js","cus/sd/salesorder/imports1/utils/utility.js","sap/base/util/deepExtend.js","sap/f/library.js","sap/m/ObjectStatus.js","sap/ui/core/Fragment.js","sap/ui/core/Item.js","sap/ui/core/mvc/Controller.js"],
"cus/sd/salesorder/imports1/controller/Reupload.controller.js":["cus/sd/salesorder/imports1/utils/commonEventHandler.js","cus/sd/salesorder/imports1/utils/formatter.js","cus/sd/salesorder/imports1/utils/utility.js","sap/base/util/deepExtend.js","sap/ui/core/MessageType.js","sap/ui/core/mvc/Controller.js"],
"cus/sd/salesorder/imports1/controller/ReuploadItem.controller.js":["cus/sd/salesorder/imports1/utils/commonEventHandler.js","cus/sd/salesorder/imports1/utils/formatter.js","cus/sd/salesorder/imports1/utils/utility.js","sap/base/util/deepExtend.js","sap/ui/core/mvc/Controller.js"],
"cus/sd/salesorder/imports1/utils/commonEventHandler.js":["sap/f/library.js","sap/m/Label.js","sap/m/Link.js","sap/m/MessageBox.js","sap/m/Title.js","sap/m/UploadCollectionParameter.js","sap/ui/core/Fragment.js","sap/ui/layout/HorizontalLayout.js","sap/ui/unified/FileUploaderParameter.js"],
"cus/sd/salesorder/imports1/utils/customUIFactory.js":["cus/sd/salesorder/imports1/utils/CONSTANTS.js","sap/m/Bar.js","sap/m/Button.js","sap/m/Dialog.js","sap/m/MessageItem.js","sap/m/MessageView.js","sap/m/Title.js"],
"cus/sd/salesorder/imports1/utils/formatter.js":["sap/ui/core/format/DateFormat.js","sap/ui/core/format/NumberFormat.js"],
"cus/sd/salesorder/imports1/utils/models.js":["sap/base/util/ObjectPath.js","sap/f/library.js","sap/ui/Device.js","sap/ui/model/json/JSONModel.js"],
"cus/sd/salesorder/imports1/utils/utility.js":["sap/base/util/deepExtend.js","sap/m/Button.js","sap/m/Column.js","sap/m/Label.js","sap/m/Link.js","sap/m/MessageBox.js","sap/m/MessageStrip.js","sap/m/ObjectStatus.js","sap/ui/base/Object.js","sap/ui/core/Fragment.js","sap/ui/core/InvisibleMessage.js","sap/ui/core/Item.js","sap/ui/core/MessageType.js","sap/ui/core/library.js"],
"cus/sd/salesorder/imports1/view/App.view.xml":["cus/sd/salesorder/imports1/controller/App.controller.js","sap/f/FlexibleColumnLayout.js","sap/ui/core/mvc/XMLView.js"],
"cus/sd/salesorder/imports1/view/Import.view.xml":["cus/sd/salesorder/imports1/controller/Import.controller.js","sap/f/DynamicPage.js","sap/f/DynamicPageHeader.js","sap/f/DynamicPageTitle.js","sap/m/Button.js","sap/m/ColumnListItem.js","sap/m/FlexBox.js","sap/m/FlexItemData.js","sap/m/Input.js","sap/m/Label.js","sap/m/OverflowToolbar.js","sap/m/OverflowToolbarLayoutData.js","sap/m/Table.js","sap/m/Title.js","sap/m/ToolbarSpacer.js","sap/m/UploadCollection.js","sap/m/VBox.js","sap/ui/core/mvc/XMLView.js","sap/ui/layout/VerticalLayout.js","sap/ui/unified/FileUploader.js"],
"cus/sd/salesorder/imports1/view/ImportHistory.view.xml":["cus/sd/salesorder/imports1/controller/ImportHistory.controller.js","sap/f/DynamicPage.js","sap/f/DynamicPageHeader.js","sap/f/DynamicPageTitle.js","sap/m/Button.js","sap/m/ColumnListItem.js","sap/m/FlexItemData.js","sap/m/OverflowToolbar.js","sap/m/Table.js","sap/m/ToolbarSpacer.js","sap/ui/comp/smartfilterbar/ControlConfiguration.js","sap/ui/comp/smartfilterbar/SmartFilterBar.js","sap/ui/comp/smarttable/SmartTable.js","sap/ui/comp/smartvariants/SmartVariantManagement.js","sap/ui/core/mvc/XMLView.js"],
"cus/sd/salesorder/imports1/view/ImportHistoryDetail.view.xml":["cus/sd/salesorder/imports1/controller/ImportHistoryDetail.controller.js","sap/f/Avatar.js","sap/m/Button.js","sap/m/Column.js","sap/m/ColumnListItem.js","sap/m/FlexBox.js","sap/m/Label.js","sap/m/ObjectAttribute.js","sap/m/ObjectStatus.js","sap/m/OverflowToolbar.js","sap/m/SearchField.js","sap/m/Table.js","sap/m/Text.js","sap/m/Title.js","sap/m/ToolbarSpacer.js","sap/m/VBox.js","sap/ui/comp/navpopover/SemanticObjectController.js","sap/ui/comp/smarttable/SmartTable.js","sap/ui/core/CustomData.js","sap/ui/core/Icon.js","sap/ui/core/mvc/XMLView.js","sap/ui/layout/VerticalLayout.js","sap/uxap/ObjectPageDynamicHeaderTitle.js","sap/uxap/ObjectPageLayout.js","sap/uxap/ObjectPageSection.js","sap/uxap/ObjectPageSubSection.js"],
"cus/sd/salesorder/imports1/view/ImportLogDetail.view.xml":["cus/sd/salesorder/imports1/controller/ImportLogDetail.controller.js","sap/m/Page.js","sap/ui/core/ComponentContainer.js","sap/ui/core/mvc/XMLView.js"],
"cus/sd/salesorder/imports1/view/Item.view.xml":["cus/sd/salesorder/imports1/controller/Item.controller.js","sap/f/DynamicPage.js","sap/f/DynamicPageHeader.js","sap/f/DynamicPageTitle.js","sap/m/Button.js","sap/m/ColumnListItem.js","sap/m/OverflowToolbar.js","sap/m/OverflowToolbarLayoutData.js","sap/m/Table.js","sap/m/Title.js","sap/m/ToolbarSpacer.js","sap/m/VBox.js","sap/ui/core/mvc/XMLView.js"],
"cus/sd/salesorder/imports1/view/Reupload.view.xml":["cus/sd/salesorder/imports1/controller/Reupload.controller.js","sap/m/Button.js","sap/m/ColumnListItem.js","sap/m/FlexBox.js","sap/m/FlexItemData.js","sap/m/Input.js","sap/m/OverflowToolbar.js","sap/m/OverflowToolbarLayoutData.js","sap/m/Page.js","sap/m/Table.js","sap/m/Title.js","sap/m/ToolbarSpacer.js","sap/m/UploadCollection.js","sap/ui/core/mvc/XMLView.js","sap/ui/layout/VerticalLayout.js","sap/ui/unified/FileUploader.js"],
"cus/sd/salesorder/imports1/view/ReuploadItem.view.xml":["cus/sd/salesorder/imports1/controller/ReuploadItem.controller.js","sap/m/Button.js","sap/m/ColumnListItem.js","sap/m/OverflowToolbar.js","sap/m/OverflowToolbarLayoutData.js","sap/m/Page.js","sap/m/Table.js","sap/m/Title.js","sap/m/ToolbarSpacer.js","sap/ui/core/mvc/XMLView.js"],
"cus/sd/salesorder/imports1/view/fragment/ActionSheet.fragment.xml":["sap/m/ActionSheet.js","sap/m/Button.js","sap/ui/core/Fragment.js","sap/ushell/ui/footerbar/AddBookmarkButton.js"],
"cus/sd/salesorder/imports1/view/fragment/ApplicationLog.fragment.xml":["sap/m/Button.js","sap/m/Dialog.js","sap/m/Page.js","sap/ui/core/ComponentContainer.js","sap/ui/core/Fragment.js"],
"cus/sd/salesorder/imports1/view/fragment/DuplicateImports.fragment.xml":["sap/m/Button.js","sap/m/Dialog.js","sap/m/Link.js","sap/m/Text.js","sap/ui/core/Fragment.js","sap/ui/layout/VerticalLayout.js"],
"cus/sd/salesorder/imports1/view/fragment/ReuploadDialog.fragment.xml":["cus/sd/salesorder/imports1/view/Reupload.view.xml","cus/sd/salesorder/imports1/view/ReuploadItem.view.xml","sap/m/Bar.js","sap/m/Button.js","sap/m/Dialog.js","sap/m/NavContainer.js","sap/m/Page.js","sap/m/Title.js","sap/ui/core/Fragment.js","sap/ui/core/mvc/XMLView.js"],
"cus/sd/salesorder/imports1/view/fragment/SettingDialogForHeader.fragment.xml":["sap/m/P13nColumnsItem.js","sap/m/P13nColumnsPanel.js","sap/m/P13nDialog.js","sap/m/P13nItem.js","sap/ui/core/Fragment.js"],
"cus/sd/salesorder/imports1/view/fragment/SettingDialogForItem.fragment.xml":["sap/m/P13nColumnsItem.js","sap/m/P13nColumnsPanel.js","sap/m/P13nDialog.js","sap/m/P13nItem.js","sap/ui/core/Fragment.js"],
"cus/sd/salesorder/imports1/view/fragment/TextObjectPopover.fragment.xml":["sap/m/Button.js","sap/m/Label.js","sap/m/ResponsivePopover.js","sap/m/Select.js","sap/m/TextArea.js","sap/ui/core/Fragment.js","sap/ui/layout/VerticalLayout.js"]
}});
