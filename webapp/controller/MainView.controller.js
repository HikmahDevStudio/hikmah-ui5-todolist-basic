sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/StandardListItem",
    "sap/ui/model/json/JSONModel"
], (Controller, Filter, FilterOperator, StandardListItem, JSONModel) => {
    "use strict";

    return Controller.extend("todolist.hds.ui5.todolist.controller.MainView", {
        onInit() {
            console.log("MainView controller initialized");
            this.bindFilteredList();
        },

        bindFilteredList(){
            //Bind pending tasks
            this.byId("taskList_pending").bindItems({
                path: "/tasks",
                filters: [new Filter("isCompleted", FilterOperator.EQ, false)],
                template: new StandardListItem({
                    title: "{title}"
                })
            });

            //Bind completed tasks
            this.byId("taskList_completed").bindItems({
                path: "/tasks",
                filters: [new Filter("isCompleted", FilterOperator.EQ, true)],
                template: new StandardListItem({
                    title: "{title}",
                    highlight: "Success"
                })
            })
        },

        submitTaskHandler() {
            this.addTaskHandler();
        },

        addTaskHandler() {
            // Read input value
            const oInput = this.byId("inputTask")
            const sInputValue = oInput.getValue().trim();

            // reset the input field
            oInput.setValue("");

            // Check if valid inputs
            if (!sInputValue.trim()) return

            // update the input to the list of task
            const aTasks = this.getView().getModel().getProperty("/tasks");
            aTasks.push({
                id: Date.now().toString(),
                title: sInputValue,
                isCompleted: false
            });

            this.getView().getModel().setProperty("/tasks", aTasks);

            console.log(aTasks)
        },
        selectTaskHandler(oEvent) {
            const oSelectedRow = oEvent?.getSource()?.getSelectedItem()?.getBindingContext()?.getObject();

            // Enable Delete / MarkComplete buttona
            if (oSelectedRow) this.byId("deleteTaskBtn").setEnabled(true);
            if (oSelectedRow && !oSelectedRow.isCompleted) this.byId("completeTaskBtn").setEnabled(true);

            if (oSelectedRow) {
                this.enabledCancelButton()
            } else this.disableCancelButton();

            if (oSelectedRow && !oSelectedRow.isCompleted) { this.enabledMarkCompleteButton() } else this.disableMarkCompleteButton();

        },

        enabledCancelButton() {
            this.byId("deleteTaskBtn").setEnabled(true);
        },

        enabledMarkCompleteButton() {
            this.byId("completeTaskBtn").setEnabled(true);
        },

        disableCancelButton() {
            this.byId("deleteTaskBtn").setEnabled(false);
        },

        disableMarkCompleteButton() {
            this.byId("completeTaskBtn").setEnabled(false);
        },

        markCompleteTaskHandler() {
            const oList = this.byId("taskList_pending");
            const oModel = this.getView().getModel();

            const oSelectedRow = oList?.getSelectedItem()?.getBindingContext()?.getObject();
            if (!oSelectedRow?.id) return;

            // oSelectedRow.isCompleted = true;
            // oModel.refresh();

            const aTasks = this.getView().getModel().getProperty("/tasks");
            const aUpdatedTasks = aTasks.map(task => {
                if(task.id === oSelectedRow.id) {
                    return {
                        ...task,
                        'isCompleted': true
                    }
                } else return task
            })

            this.getView().getModel().setProperty("/tasks", aUpdatedTasks);

            this.disableCancelButton();
            this.disableMarkCompleteButton();
        },

        deleteTaskHandler() {
            const sSelectedTaskId = this.byId("taskList_pending")?.getSelectedItem()?.getBindingContext()?.getObject()?.id;

            if (!sSelectedTaskId) return;

            const aTasks = this.getView().getModel().getProperty("/tasks");

            const aUpdatedTasks = aTasks.filter(task => task.id !== sSelectedTaskId);
            this.getView().getModel().setProperty("/tasks", aUpdatedTasks);

            this.byId("taskList_pending").removeSelections(true);

            // Disabled the delete button
            this.disableCancelButton();
            this.disableMarkCompleteButton();
        }
    });
});