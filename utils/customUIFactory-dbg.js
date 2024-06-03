/*
 * Copyright (C) 2009-2022 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/m/MessageView",
	"sap/m/MessageItem",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/m/Dialog",
	"cus/sd/salesorder/imports1/utils/CONSTANTS"
], function (MessageView, MessageItem, Button, Bar, Title, Dialog, CNSTS) {
	"use strict";

	return {
		buildMessageViewDialog: function (aMessages, sDialogTitle, sCloseBtnText, sDialogState) {
			var oMessageTemplate = new MessageItem({
				type: "{type}",
				title: "{title}",
				subtitle: "{subtitle}",
				description: "{description}"
			});
			var oBackButton;
			var oMessageView = new MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "/messages",
					template: oMessageTemplate
				}
			});
			oBackButton = new Button({
				icon: "sap-icon://nav-back",
				visible: false,
				press: function () {
					oMessageView.navigateBack();
					this.setVisible(false);
				}
			});
			var oDialogTitle = new sap.m.Title({
				text: sDialogTitle
			});
			var oMessageDialog = new Dialog({
				state: sDialogState ? sDialogState : CNSTS.DEFAULT_DIALOG_STATE,
				content: oMessageView,
				customHeader: new sap.m.Bar({
					contentLeft: [oBackButton, oDialogTitle]
				}),
				beginButton: new Button({
					press: function () {
						oMessageDialog.close();
					},
					text: sCloseBtnText
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
			oMessageDialog.setModel(new sap.ui.model.json.JSONModel({
				"messages": aMessages
			}));
			return oMessageDialog;
		}
	};
});