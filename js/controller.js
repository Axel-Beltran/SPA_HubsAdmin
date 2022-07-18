var ngApp = angular.module('HubsAdminApp', ['ngRoute']);
ngApp.config(function ($routeProvider) {
    $routeProvider
        .when('/directories', {
            controller: 'HubsAdminController',
            templateUrl: '/../DesktopModules/SPA_HubsAdmin/views/directories.html'
        })
        .when('/directoryHubs', {
            controller: 'HubsAdminController',
            templateUrl: '/../DesktopModules/SPA_HubsAdmin/views/directoryHubs.html'
        })
        .otherwise({
            redirectTo: '/directories'
        });
});

ngApp.controller('HubsAdminController', function ($scope, $http) {
    $scope.service = {};
    $scope.service.getDirectories = {};
    $scope.service.getDirectoryHubs = {};
    $scope.service.getZones = {};
    $scope.service.getVendors = {};
    $scope.service.getStates = {};
    $scope.service.getAccessTypes = {};
    $scope.service.getDirectories.request = {};
    $scope.service.getDirectories.response = {};
    $scope.service.getDirectoryHubs.request = {};
    $scope.service.getDirectoryHubs.response = {};
    $scope.service.getZones.request = {};
    $scope.service.getZones.response = {};
    $scope.service.getVendors.request = {};
    $scope.service.getVendors.response = {};
    $scope.service.getStates.request = {};
    $scope.service.getStates.response = {};
    $scope.service.getAccessTypes.request = {};
    $scope.service.getAccessTypes.response = {};
    $scope.service.getDirectories.request.includeLazy = true;
    console.log($scope.service.getDirectories.request)
    $scope.service.createDirectoryHub = {};
    $scope.service.createDirectoryHub.request = {};
    $scope.service.createDirectoryHub.response = {};
    $scope.service.updateDirectoryHub = {};
    $scope.service.updateDirectoryHub.request = {};
    $scope.service.updateDirectoryHub.response = {};
    $scope.service.updateDirectory = {};
    $scope.service.updateDirectory.request = {};
    $scope.service.updateDirectory.response = {};
    $scope.service.createDirectory = {};
    $scope.service.createDirectory.request = {};
    $scope.service.createDirectory.response = {};
    $scope.service.deleteDirectory = {};
    $scope.service.deleteDirectory.request = {};
    $scope.service.deleteDirectory.response = {};
    GetHubs();
    GetDirectoryHubs();

    function GetHubs() {
        $http({
            method: "POST",
            url: serverUrl + "/hubsMinimalApi/getDirectories",
            data: angular.toJson($scope.service.getDirectories.request)
        }).then(function (result) {
            console.log(result.data);
            $scope.service.getDirectories.response = result.data;
        }, function myError(response) {
            console.log(response);
        });
    }

    function GetDirectoryHubs() {
        $http({
            method: "POST",
            url: serverUrl + "/hubsMinimalApi/getDirectoryHubs",
            data: angular.toJson($scope.service.getDirectoryHubs.request)
        }).then(function (result) {
            console.log(result.data);
            $scope.service.getDirectoryHubs.response = result.data;
        }, function myError(response) {
            console.log(response);
        });
    }

    function GetZones() {
        $http({
            method: "POST",
            url: serverUrl + "/hubsMinimalApi/getZones",
            data: angular.toJson($scope.service.getZones.request)
        }).then(function (result) {
            console.log(result.data);
            $scope.service.getZones.response = result.data;
        }, function myError(response) {
            console.log(response);
        });
    }

    function GetVendors() {
        $http({
            method: "POST",
            url: serverUrl + "/hubsMinimalApi/getVendors",
            data: angular.toJson($scope.service.getVendors.request)
        }).then(function (result) {
            console.log(result.data);
            $scope.service.getVendors.response = result.data;
        }, function myError(response) {
            console.log(response);
        });
    }

    function GetAccessTypes() {
        $http({
            method: "POST",
            url: serverUrl + "/hubsMinimalApi/getAccessTypes",
            data: angular.toJson($scope.service.getAccessTypes.request)
        }).then(function (result) {
            console.log(result.data);
            $scope.service.getAccessTypes.response = result.data;
        }, function myError(response) {
            console.log(response);
        });
    }

    function GetStates() {
        $http({
            method: "POST",
            url: serverUrl + "/hubsMinimalApi/getStates",
            data: angular.toJson($scope.service.getStates.request)
        }).then(function (result) {
            console.log(result.data);
            $scope.service.getStates.response = result.data;
        }, function myError(response) {
            console.log(response);
        });
    }

    function limpiar() {
        $("#Name").val('');
        $("#Address").val('');
        $("#OuterMesh").val('');
        $("#Availavility").val('');
        $("#HubOlt").val('');
        $("#SlaMdr").val('');
        $("#SlaSupplierOutInn").val('');
        $("#createName").val('');
        $("#createPhone").val('');
        $("#createEmail").val('');
        $("#createLv").val('');
    }

    $scope.createDirectory = function () {
        console.log("Entre a createDirectory");
            $scope.service.createDirectory.request.name = $('#Name').val(),
                $scope.service.createDirectory.request.address = $('#Address').val(),
                $scope.service.createDirectory.request.vendorId = $('#newVendorId').val(),
                $scope.service.createDirectory.request.stateId = $('#newStateId').val(),
                $scope.service.createDirectory.request.zoneId = $('#newZoneId').val(),
                $scope.service.createDirectory.request.accessTypeId = $('#newAccessTypeId').val(),
                $scope.service.createDirectory.request.outerMesh = $('#OuterMesh').val(),
                $scope.service.createDirectory.request.availability = $('#Availability').val(),
                $scope.service.createDirectory.request.hubOlt = $('#HubOlt').val(),
                $scope.service.createDirectory.request.slaMdr = $('#SlaMdr').val(),
                $scope.service.createDirectory.request.slaSupplierOutInn = $('#SlaSupplierOutInn').val(),
                $scope.service.createDirectory.request.directoryHubId = $('#HubId').val(),
                $scope.service.createDirectory.request.directoryHubId2 = $('#HubId2').val(),
            $http({
                method: "POST",
                url: serverUrl + "/hubsMinimalApi/createDirectory",
                data: angular.toJson($scope.service.createDirectory.request)
            }).then(function (result) {
                console.log(result.data);
                $scope.service.createDirectory.response = result.data;
                $("#createDirectoryModal").modal("hide");
                //$("#statusModal").modal("show");
                Swal.fire({
                    icon: 'success',
                    title: 'Registro creado!',
                    text: '¡Acción completada con éxito!',
                })
                GetHubs();
            }, function myError(response) {
                console.log(response);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Oooops, algo salió mal!',
                })
            });
    }

    $scope.updateDirectory = function () {
        console.log("Entre a updateDirectory");
            $scope.service.updateDirectory.request.id = $('#idRoot').val(),
            $scope.service.updateDirectory.request.name = $('#directoryName').val(),
            $scope.service.updateDirectory.request.address = $('#directoryAddress').val(),
            $scope.service.updateDirectory.request.vendorId = $('#vendorId').val(),
            $scope.service.updateDirectory.request.stateId = $('#stateId').val(),
            $scope.service.updateDirectory.request.zoneId = $('#zoneId').val(),
            $scope.service.updateDirectory.request.accessTypeId = $('#accessTypeId').val(),
            $scope.service.updateDirectory.request.outerMesh = $('#directoryOuterMesh').val(),
            $scope.service.updateDirectory.request.availability = $('#directoryAvailability').val(),
            $scope.service.updateDirectory.request.hubOlt = $('#directoryHubOlt').val(),
            $scope.service.updateDirectory.request.slaMdr = $('#directorySlaMdr').val(),
            $scope.service.updateDirectory.request.slaSupplierOutInn = $('#directorySlaSupplierOutInn').val(),
            $scope.service.updateDirectory.request.directoryHubId = $('#directoryHubId').val(),
            $scope.service.updateDirectory.request.directoryHubId2 = $('#directoryHubId2').val(),
            $http({
                method: "POST",
                url: serverUrl + "/hubsMinimalApi/updateDirectory",
                data: angular.toJson($scope.service.updateDirectory.request)
            }).then(function (result) {
                console.log(result.data);
                $scope.service.updateDirectory.response = result.data;
                $("#updateDirectoryModal").modal("hide");
                GetHubs();
                //$("#statusModal").modal("show");
                Swal.fire({
                    icon: 'success',
                    title: 'Registro actualizado',
                    text: '¡Acción completada con éxito!',
                })
            }, function myError(response) {
                console.log(response);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Oooops, algo salió mal!',
                })
            });
    }

    $scope.deleteDirectory = function (id) {
        console.log("Entre a deleteDirectory");
        Swal.fire({
            title: '¿Está seguro de eliminar este registro?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Borrar',
            denyButtonText: `No borrar`,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.service.deleteDirectory.request.id = id,
                $http({
                    method: "POST",
                    url: serverUrl + "/hubsMinimalApi/deleteDirectory",
                    data: angular.toJson($scope.service.deleteDirectory.request)
                }).then(function (result) {
                    console.log(result.data);
                    $scope.service.deleteDirectory.response = result.data;
                    $("#createDirectoryModal").modal("hide");
                    GetHubs();
                    Swal.fire('¡Registro eliminado exitosamente!', '', 'success')
                }, function myError(response) {
                    console.log(response);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Oooops, algo salió mal!',
                    })
                });
            } else if (result.isDenied) {
                Swal.fire('Bien, no se eliminó el registro', '', 'info')
            }
        })
    }

    $scope.createDirectoryHub = function () {
        console.log("Entre a createDirectoryHub");
        $scope.service.createDirectoryHub.request.name = $('#createName').val(),
            $scope.service.createDirectoryHub.request.phone = $('#createPhone').val(),
            $scope.service.createDirectoryHub.request.email = $('#createEmail').val(),
            $scope.service.createDirectoryHub.request.lv = $('#createLv').val(),
            $http({
                method: "POST",
                url: serverUrl + "/hubsMinimalApi/createDirectoryHub",
                data: angular.toJson($scope.service.createDirectoryHub.request)
            }).then(function (result) {
                console.log(result.data);
                $scope.service.createDirectoryHub.response = result.data;
                $("#createHubModal").modal("hide");
                Swal.fire({
                    icon: 'success',
                    title: 'Registro creado!',
                    text: '¡Acción completada con éxito!',
                })
                GetDirectoryHubs();
            }, function myError(response) {
                console.log(response);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Oooops, algo salió mal!',
                })
            });
    }

    $scope.updateDirectoryHub = function () {
        console.log("Entre a updateDirectoryHub");
        $scope.service.updateDirectoryHub.request.id = $('#idHub').val(),
            $scope.service.updateDirectoryHub.request.name = $('#hubName').val(),
            $scope.service.updateDirectoryHub.request.phone = $('#hubPhone').val(),
            $scope.service.updateDirectoryHub.request.email = $('#hubEmail').val(),
            $scope.service.updateDirectoryHub.request.lv = $('#hubLv').val(),
            $http({
                method: "POST",
                url: serverUrl + "/hubsMinimalApi/updateDirectoryHub",
                data: angular.toJson($scope.service.updateDirectoryHub.request)
            }).then(function (result) {
                console.log(result.data);
                $scope.service.updateDirectoryHub.response = result.data;
                GetDirectoryHubs();
                $("#updateHubModal").modal("hide");
                Swal.fire({
                    icon: 'success',
                    title: 'Registro actualizado!',
                    text: '¡Acción completada con éxito!',
                })
            }, function myError(response) {
                console.log(response);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Oooops, algo salió mal!',
                })
            });
    }

    $scope.getHubById = function (item) {
        console.log("Entre a getHubById");
        $('#hubName').val(item.name);
        $('#hubPhone').val(item.phone);
        $('#hubEmail').val(item.email);
        $('#hubLv').val(item.lv);
        $('#idHub').val(item.id);
        $("#updateHubModal").modal("show");
    };

    $scope.getDirectoryById = function (item) {
        console.log("Entre a getDirectoryById");
        $scope.vendorId = item.vendor.id;
        $scope.stateId = item.state.id;
        $scope.zoneId = item.zone.id;
        $scope.accessTypeId = item.accessType.id;
        $scope.directoryHubId = item.directoryHub.id;
        $scope.directoryHubId2 = item.directoryHub2.id;
        $('#idRoot').val(item.id);
        $('#directoryName').val(item.name);
        $('#directoryAddress').val(item.address);
        $('#directoryOuterMesh').val(item.outerMesh);
        $('#directoryAvailability').val(item.availability);
        $('#directoryHubOlt').val(item.hubOlt);
        $('#directorySlaMdr').val(item.slaMdr);
        $('#directorySlaSupplierOutInn').val(item.slaSupplierOutInn);
        GetDirectoryHubs();
        GetVendors();
        GetZones();
        GetAccessTypes();
        GetStates();
        $("#updateDirectoryModal").modal("show");
    };

    $scope.openCreateModal = function () {
        limpiar();
        GetDirectoryHubs();
        GetVendors();
        GetZones();
        GetAccessTypes();
        GetStates();
        $("#createDirectoryModal").modal("show");
    };

    $scope.openCreateHubModal = function () {
        limpiar();
        $("#createHubModal").modal("show");
    };

    $scope.closeModal = function () {
        $("#createDirectoryModal").modal("hide")
        $("#updateDirectoryModal").modal("hide")
        $("#createHubModal").modal("hide")
        $("#updateHubModal").modal("hide")
        $("#statusModal").modal("hide")
        GetHubs();
    }

});