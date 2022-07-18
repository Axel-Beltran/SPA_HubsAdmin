var TOKEN_kEY = 'user-access-token';
var screenAccess = [];
var angularRoutingApp = angular.module('angularRoutingApp', ['ngRoute','ngTable']);
var fileByteArray ;
// Configuración de las rutas
angularRoutingApp.config(function($routeProvider) {

    $routeProvider
        .when('/userRegistration', {
           templateUrl: '/../DesktopModules/CWEB_Single_Sing_On/views/user-registration.html',
           controller: 'userRegistrationController'
        })
        .when('/Process', {
           templateUrl: '/../DesktopModules/CWEB_Single_Sing_On/views/process-registration.html',
           controller: 'processRegistrationController'
        })
        .when('/Screend', {
            templateUrl: '/../DesktopModules/CWEB_Single_Sing_On/views/Screend.html',
            controller: 'ScreendController'
        })
        .when('/SpaByRol', {
            templateUrl: '/../DesktopModules/CWEB_Single_Sing_On/views/Screend-Rol.html',
            controller: 'SpaByRolController'
        })
        .otherwise({
            redirectTo: '/userRegistration'
        });   
});

angularRoutingApp.controller('mainController', function ($scope, $window, $http) {


});

angularRoutingApp.controller('userRegistrationController', function ($scope, $http, $filter,NgTableParams) {

    $scope.AuxProcessId =  "";
    $scope.usuarioSeleccionado = {};
    $scope.existUser = [];
    $scope.users = [];  

    $scope.users = [];
    $scope.selectedUsers = [];
    $scope.ldapUsers = [];
    $scope.nsUser = false;
    $scope.modelUser = false;
    $scope.btnEdit = false;
    $scope.swEdit =  false;

    $scope.startInfo = function () {
        $scope.isRunningUsers = true;
        $scope.getAllUsers();
        $scope.isRunningUsers = false;
    }
    $scope.getAllUsers = function() {
        spinnerOn();
          $scope.processUserDto = {};
          $scope.processUserDto.IncludeLazy = true;
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetUsers",
            data: angular.toJson($scope.processUserDto)
        }).then(function mySuccess(response) {
            if (response.data.length>0 && response.data[0].ErrorMessage == null) {


                spinnerOff();
                $scope.users = [];
                $scope.filterList = [];
                $scope.editUser = true;
                $scope.deleteUser = true;
                $scope.users = response.data;
                $scope.perPage = 10;
                $scope.maxSize = 5;
                $scope.$watch('searchText', function (term) {
                    var obj = term;
                    $scope.filterList = $filter('filter')($scope.users, obj);
                    $scope.currentPage = 1;
                });
                $scope.tableUsers = new NgTableParams({}, { dataset: response.data});  

            }else {
                if( response.data.ErrorMessage != null)
                {
                    Swal.fire('Error de Servicio ' + response.data.ErrorMessage);
                    spinnerOff();
                }else
                {
                    Swal.fire('No hay usuarios registrados');
                    spinnerOff();
                }
              

            }
        }, function myError(response) {
            spinnerOff();
            Swal.fire('Búsqueda de usuarios', 'Error al realizar solicitud', 'error');
        });
    }
    $scope.getLdapUserByFilter = function (SearchLdapUser) {
       
        spinnerOn();
            $http({
                method: "GET",
                url: urlMwServer + "/rest/GetLdapUsersByFilter",
                params: { filter: SearchLdapUser.trim() }
            }).then(function mySuccess(response) {
                if (response.data.length > 0) {
                    spinnerOff();
                    $scope.getRoles();
                    $scope.ldapUsers.push(response.data[0]);
                    $("#btnAgregarNuevo").show();
                } else {
                    spinnerOff();
                    alert('Búsqueda de usuario en ldap', 'No se encontraron coincidencias', 'error');
                }

                $scope.isRunningSearchUsers = false;
            }, function myError(response) {
                spinnerOff();
                alert('Búsqueda de usuario en ldap', 'Error al realizar solicitud', 'error');
            });
      
       
    }
    $scope.showUsersModal = function (usuario) {
        $("#usersModal").modal("show");
    }
    $scope.showEditUsersModal = function (user) {
     
         $("#EditUserModal").modal("show");
        $scope.usuarioSeleccionado = {
            UserId: user.UserId,
            Name: user.Name,
            LastName: user.LastName,
            UserName: user.UserName,
            Email: user.Email,
            Active: user.Active,
            RoleId: user.RoleId,
            ProcessId :  user.ProcessId,
            RegisterDate: user.RegisterDate,
            RegisterUser: user.RegisterUser,
            LastSession: user.LastSession,
            LastUserModifying: user.LastUserModifying,
            LastModify: user.LastModify
        }
        $scope.getRoles();
    }
    $scope.SelectProcess = function(role)
    {
       $scope.AuxProcessId =  $scope.userRoles.find(d=>d.RoleId == role.RoleId).ProcessId;
       $scope.usuarioSeleccionado.ProcessId =  $scope.AuxProcessId;
    }
    $scope.getRoles = function() {
        $scope.processRoleDto = {};
        $scope.processRoleDto.IncludeLazy = true
        $scope.processRoleDto.Active = 1 ;
    
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetProcessRoles",
            data: angular.toJson($scope.processRoleDto)
        }).then(function mySuccess(response) {
            if(response.data[0]['ErrorMessage'] == null){
                $scope.userRoles = response.data;   
               
            } else{
                // Swal.fire('Búsqueda de roles', 'Error al realizar solicitud', 'error');
            }
        }, function myError(response) {
            Swal.fire('Búsqueda de roles', 'Error al realizar solicitud', 'error');
        });
    }
    $scope.createLdapUsers = function () {
        if($scope.existUser.length >0)
        {
            $scope.isRunningSearchUsers = true;
            $http({
                method: "POST",
                url: urlMwServer + "/rest/CreateProcessUser",
                data: angular.toJson($scope.existUser)
            }).then(function (result) {
                if (result.data.TransactionStatus == true) {
                    $scope.getAllUsers();
                    $scope.selectedUsers = [];
                    $scope.existUser = [];
                    $scope.ldapUsers = [];
                    $("#txtSearchUser").val("");
                    $("#usersModal").modal("hide");
                    Swal.fire('Confirmado', 'Se agrego el usuario correctamente', 'success');
                    $scope.isRunningSearchUsers = false;
    
                } else {
                    Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                    $scope.isRunningSearchUsers = false;
    
                }
              
            }, function myError(response) {
                    alert('Alta de usuario', 'Error al realizar solicitud', 'error');
            });
        }
       
    }
    $scope.ExistUser= function()
    {
        $scope.existUser = [];
        $scope.selectedUsers.forEach(usr=>
            {
                $scope.AuxUser = 
                $scope.users.find(d=>d.UserName === usr.UserName && d.RoleId === usr.RoleId && d.ProcessId === usr.ProcessId);
                if( $scope.AuxUser == undefined)
                {
                    $scope.existUser.push(usr);
                }else
                {
                    Swal.fire('Confirmado',"El usaurio Usurio " + usr.UserName + " ya existe", 'warning');

                }
            });
            $scope.createLdapUsers();
    };
    $scope.addSearchUserArray = function (item, list, roleId,procesId) {
        // var cookie = $cookieStore.get(TOKEN_kEY);
        var dateNow = new Date();
        item.RegisterDate = dateNow;
        // item.RegisterUser = cookie.UserName;
        item.Active = 1;
        item.RoleId = roleId;
        item.LastModify = dateNow;
        // item.LastUserModifying = cookie.UserName;
        item.ProcessId = procesId;
       

        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        }
        else {
            list.push(item);
        }
    };
    $scope.deleteUserTable = function(item)
    {
        var idx = $scope.ldapUsers.indexOf(item);
        if (idx > -1) {
            $scope.ldapUsers.splice(idx, 1);
        }
        else {
            $scope.ldapUsers.push(item);
        }
    }; 
    $scope.existsUserArray = function (item, list) {
        return list.indexOf(item) > -1;
    };
    $scope.newUser = function (modelUser) {
        if($scope.modelUser == false)
        {
            $scope.clientSearch = '';
            $scope.usuarioSeleccionado = {};
            $scope.nsUser = true;  
            $scope.modelUser = true; 
        }else
        {
            $scope.clientSearch = '';
            $scope.usuarioSeleccionado = {};
            $scope.nsUser = false; 
            $scope.modelUser = false;   
        }
       
    }

    $scope.userUpdate = function () {
        spinnerOn();
         $scope.UserSelect = 
         {
            UserName : $scope.usuarioSeleccionado.UserName,
            // UserId : $scope.usuarioSeleccionado.UserId,
            RoleId : $scope.usuarioSeleccionado.RoleId,
            ProcessId : $scope.usuarioSeleccionado.ProcessId,
            IncludeLazy : false,
         }
          
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetUsers",
            data: angular.toJson($scope.UserSelect)
        }).then(function (result) {
           if(result.data.length>0){
            Swal.fire("Afirmación","El usuario si existes con rol","warning");
  
           }else
           {
            Swal.fire({
                title: '¿Estas seguro de Actualizar el usuario?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirmar'
              }).then((result) => {
                if (result.isConfirmed) {
                    var dateNow = new Date();
                    $scope.usuarioSeleccionado.LastModify = dateNow;
                    $http({
                        method: "POST",
                        url: urlMwServer + "/rest/DeleteUser",
                        data: angular.toJson($scope.usuarioSeleccionado)
                    }).then(function (result) {
                        if (result.data.TransactionStatus == true) {
                            $scope.processUserDto = [];
                            $scope.processUserDto.push($scope.usuarioSeleccionado);
                            $http({
                                method: "POST",
                                url: urlMwServer + "/rest/CreateProcessUser",
                                data: angular.toJson($scope.processUserDto)
                            }).then(function (result) {
                                if (result.data.TransactionStatus == true) {
                                    $scope.processUserDto = [];
                                    $scope.usuarioSeleccionado = {};
                                    $scope.getAllUsers();
                                    $("#EditUserModal").modal("hide");
                                    Swal.fire('Confirmado', 'Se actualizo correctamente el usuario', 'success');                    
                                } else {
                                    Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                                }
                            }, function myError(response) {
                                Swal.fire('Error', result.data.ErrorMessage, 'error');
                            });
                        } else{
                            Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                        }
                        
                    }, function myError(response) {
                        Swal.fire(
                            'Error',
                            'Error de Servicio',
                            'warning'
                          )         
                    });                  
                }
              });
           }
            
        }, function myError(response) {
            Swal.fire(
                'Error',
                'Error de Servicio',
                'warning'
              )  
        });
    }

    $scope.userDeactivate = function (usuario,activate) {
        Swal.fire({
            title: 'Confirme operación',
            text: "¿Desea desactivar al usuario " + usuario.UserName + "?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No, cancelar',
            confirmButtonClass: 'btn btn-success mt-2',
            cancelButtonClass: 'btn btn-danger ms-2 mt-2',
            buttonsStyling: false,
        }).then(function (result) {
            if (result.value) {
                Swal.fire({
                    title: 'Confirmado',
                    text: 'Se ha enviado la instrucción',
                    icon: 'success',
                });
                // var cookie = $cookieStore.get(TOKEN_kEY);
                var dateNow = new Date();
                usuario.LastModify = dateNow;
                // usuario.LastUserModifying = cookie.UserName;
                $scope.usuarioSeleccionado = {
                    UserId: usuario.UserId,
                    Name: usuario.Name,
                    LastName: usuario.LastName,
                    UserName: usuario.UserName,
                    Email: usuario.Email,
                    Active: activate,
                    RoleId: usuario.RoleId,
                    ProcessId : usuario.ProcessId,
                    RegisterDate: usuario.RegisterDate,
                    RegisterUser: usuario.RegisterUser,
                    LastSession: usuario.LastSession,
                    LastModify: usuario.LastModify,
                    LastUserModifying: usuario.LastUserModifying
                }
                
                $http({
                    method: "POST",
                    url: urlMwServer + "/rest/UpdateUser",
                    data: angular.toJson($scope.usuarioSeleccionado)
                }).then(function mySuccess(response) {
                    if (response.data.TransactionStatus == true) {
                        Swal.fire({
                            title: 'Confirmado',
                            text: 'Usuario ' + usuario.UserName + " fue desactivado.",
                            icon: 'success',
                        })
                    } else {
                        Swal.fire({
                            title: 'Confirmado',
                            text: result.data,
                            icon: 'error',
                        })
                    }
                    $scope.getAllUsers();
                }, function myError(response) {
                        alert('Eliminar usuario', 'Error al realizar solicitud', 'error');
                });
            } else if (
                // Read more about handling dismissals
                result.dismiss === Swal.DismissReason.cancel
            ) {
                Swal.fire({
                    title: 'Cancelada',
                    text: 'Operación cancelada',
                    icon: 'error',
                })
            }
        });
    }
    $scope.userDelete = function (usuario) {
        Swal.fire({
            title: 'Confirme operación',
            text: "¿Desea Eliminar al usuario " + usuario.UserName + "?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No, cancelar',
            confirmButtonClass: 'btn btn-success mt-2',
            cancelButtonClass: 'btn btn-danger ms-2 mt-2',
            buttonsStyling: false,
        }).then(function (result) {
            if (result.value) {
                Swal.fire({
                    title: 'Confirmado',
                    text: 'Se ha enviado la instrucción',
                    icon: 'success',
                });
                // var cookie = $cookieStore.get(TOKEN_kEY);
                var dateNow = new Date();
                usuario.LastModify = dateNow;
                // usuario.LastUserModifying = cookie.UserName;
                $scope.usuarioSeleccionado = {
                    UserId: usuario.UserId,
                    Name: usuario.Name,
                    LastName: usuario.LastName,
                    UserName: usuario.UserName,
                    Email: usuario.Email,
                    Active: 0,
                    RoleId: usuario.RoleId,
                    RegisterDate: usuario.RegisterDate,
                    RegisterUser: usuario.RegisterUser,
                    LastSession: usuario.LastSession,
                    LastModify: usuario.LastModify,
                    LastUserModifying: usuario.LastUserModifying
                }
                
                $http({
                    method: "POST",
                    url: urlMwServer + "/rest/DeleteUser",
                    data: angular.toJson($scope.usuarioSeleccionado)
                }).then(function mySuccess(response) {
                    if (response.data.TransactionStatus == true) {
                        Swal.fire({
                            title: 'Confirmado',
                            text: 'Usuario ' + usuario.UserName + " fue Eliminado.",
                            icon: 'success',
                        })
                    } else {
                        Swal.fire({
                            title: 'Confirmado',
                            text: result.data,
                            icon: 'error',
                        })
                    }
                    $scope.getAllUsers();
                }, function myError(response) {
                        alert('Eliminar usuario', 'Error al realizar solicitud', 'error');
                });
            } else if (
                // Read more about handling dismissals
                result.dismiss === Swal.DismissReason.cancel
            ) {
                Swal.fire({
                    title: 'Cancelada',
                    text: 'Operación cancelada',
                    icon: 'error',
                })
            }
        });
    }
});
angularRoutingApp.controller('processRegistrationController', function ($scope, $http, $filter) {

    $scope.clientWebId = 26;
    $scope.ProcessDTO = {};
    $scope.ProcessRollDTO = {};
    $scope.tabSaveDashboard = true;
    $scope.tabOtherDashboard = false;
    $scope.chkOtherDashboardValue =  false;
    $scope.tabAddRoleProcess = true;
    $scope.ProcessId = 0;
    $scope.disabled = true;
    
    $scope.StatusRole = 0;
    $scope.processInit = function (){
        LoadGenericDashboard();
        LoadProcess();
        GetProcessRole();
    }
    function LoadGenericDashboard (){
        spinnerOn();
        $http({
            method: "GET",
            url: urlMwServer + "/rest/GetAllCatBoardSection"
        }).then(function (responseProcessData) { 
           spinnerOff();   
         $scope.responseDashboardGeneric =  responseProcessData.data.filter(x=>x.SectionDashboard == "MicroSitio General");
         $scope.responseProcessRoll = responseProcessData.data; 
           }, function myError(response) {
            Swal.fire(
                'Error',
                'Error de Servicio GetAllCatBoardSection',
                'error'
              );  
              spinnerOff();
        });
    };
    function LoadProcess(){
        spinnerOn();
        $http({
            method: "GET",
            url: urlMwServer + "/rest/GetProcess",
            params: {
				typeId:  $scope.clientWebId,
			}
        }).then(function (responseProcessDto) {    
            spinnerOff();
         $scope.responseProcess =  responseProcessDto.data;
           }, function myError(response) {
            Swal.fire('Error de Petición', 'Error al realizar solicitud GetProcess', 'error');

              spinnerOff();
        });
    };
    function GetProcessRole(){
        spinnerOn();
        $scope.roleDto = {};
        $scope.roleDto.IncludeLazy = true;
        $http({
            method: "POST",
            url: urlMwServer + "/rest/RoleByProcess", 
            data: angular.toJson($scope.roleDto)
        }).then(function (responseProcessDto) {    
            spinnerOff();
            $scope.responseRoleByProcess =  responseProcessDto.data;    
           }, function myError(response) {
            Swal.fire('Error de Petición', 'Error al realizar solicitud RoleByProcess', 'error');
              spinnerOff();
        });
    };
    $scope.chkOtherDashboard = function(){        
        if($scope.vm.activo == true){
          $scope.tabOtherDashboard = true;
          $scope.tabSaveDashboard =  false;
          $scope.tabEditProcess = false;    
          LoadGenericDashboard();
          $scope.chkOtherDashboardValue = true;
          $scope.SaveRowProcess = true;           
        }
        else{
          $scope.tabOtherDashboard = false;
          $scope.tabSaveDashboard =  true;
          
        }
    };
    $scope.AddDashBoardProcess = function (siteDNNModel){    

        if($scope.chkOtherDashboardValue == false )
        {
            $scope.ProcessDTO.ProcessName = siteDNNModel.Name;
            $scope.ProcessDTO.TypeId = $scope.clientWebId;
            $scope.ProcessDTO.ServiceUrl = siteDNNModel.Url;
        }
        else{
            $scope.ProcessDTO.ProcessName = $scope.txtNameDashboard ;
            $scope.ProcessDTO.TypeId = $scope.clientWebId;
            $scope.ProcessDTO.ServiceUrl = $scope.txtUrl;             
            $scope.SaveProcess();
        }
    };  
    $scope.SaveProcess =  function (){
        $scope.processDto = [];
        $scope.processDto.push($scope.ProcessDTO);
        $http({
            method: "POST",
            url: urlMwServer + "/rest/CreateProcess",
            data: angular.toJson($scope.processDto)
        }).then(function (responseSave) { 
            $scope.processDto = [];   
            $scope.processInit();
            alert("Correcto", "Fue registrado de manera correcta","success");
           }, function () {     
            alert("Error", "Error en la petición del servidor","error");
        });        
    };
    $scope.addUpdateProcess = function (process){
        $scope.tabEditProcess = true;        
        $scope.tabOtherDashboard = true;
        $scope.tabSaveDashboard =  false;
        $scope.SaveRowProcess =  false;
        $scope.txtNameDashboard = process.ProcessName;
        $scope.txtUrl =  process.ServiceUrl;
        $scope.ProcessId = process.ProcessId;
       
    };
    $scope.UpdateProcess = function()
    {
            $scope.ProcessDTO.ProcessName = $scope.txtNameDashboard ;
            $scope.ProcessDTO.TypeId = $scope.clientWebId;
            $scope.ProcessDTO.ServiceUrl = $scope.txtUrl; 
            $scope.ProcessDTO.ProcessId = $scope.ProcessId;
            $http({
                method: "POST",
                url: urlMwServer + "/rest/UpdateProcess",
                data: angular.toJson($scope.ProcessDTO)
            }).then(function (responseSave) {    
                $scope.processInit();
                alert("Correcto", "El proceso de actualización fue exitosa","success");
               }, function () {    
                alert("Error", "Error en la petición del servidor","error");
            }); 
            
            
    }           
    $scope.chkAddRole=function(){
        if($scope.chkAddRole.activo == true)
        {
            $scope.tabAddRoleProcess = false;
            $scope.tabFormAddRoleProcess = true;
            $scope.SaveProcessRoll = true;
        }
        else{

        }
    }
    $scope.AddProcessRoll = function(siteProcessModel,name,description,chkAddRoleActive)
    {
        if(siteProcessModel != "Empty" && name != undefined && description != undefined)
        {
            const active = 1;             
            $scope.ProcessRollDTO.RoleName =  name;
            $scope.ProcessRollDTO.Description = description
            $scope.ProcessRollDTO.ProcessId = siteProcessModel.ProcessId;
            $scope.ProcessRollDTO.Active = chkAddRoleActive == undefined ? 0 : active;
            
        }
        else{
            alert('Validación de campos','No pueden agregarse valores Nulos','error')
        }
        
    };
    $scope.CreateProcessRol = function(){

         $scope.SearchRole = {
            RoleName : $scope.UIprocess.RoleName,
            Description : $scope.UIprocess.Description
         };
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetProcessRoles",
            data: angular.toJson($scope.SearchRole)
        }).then(function (respose) {
            if(respose.data.length > 0)
            {
                Swal.fire('Advertencia', 'Ya existe el rol', 'warning');
            }
            else{
                $scope.ProcessRoleArray = [];
                $scope.ProcessRoleArray.push($scope.UIprocess);
                $http({
                    method: "POST",
                    url: urlMwServer + "/rest/CreateProcessRole",
                    data: angular.toJson($scope.ProcessRoleArray)
                }).then(function (responseSaveProcessRoll) {
                    if(responseSaveProcessRoll.data.TransactionStatus == true)
                    {
                        $scope.processInit();
                        Swal.fire('Confirmación', 'Se da alta correctamente el Rol', 'success');
                        $scope.UIprocess = {};
                    }
                    else{
                        Swal.fire('Advertencia', 'Error ' + responseSaveProcessRoll.data.ErrorMessage , 'warning');
                    }
                   }, function (responseSaveProcessRoll) {  
                    Swal.fire('Advertencia', 'Error de peticion ' + responseSaveProcessRoll.data.ErrorMessage, 'warning');
                }); 
            }
           }, function (responseSaveProcessRoll) {  
            Swal.fire('Advertencia', 'Error de peticion ' + responseSaveProcessRoll.data.ErrorMessage, 'warning');
        }); 


      
    };  
    $scope.AddUpdateProcessRole =  function(roleProcess){
       $scope.UiProcessRole = {
        RoleName : roleProcess.RoleName,
        Description:  roleProcess.Description,
        RoleId : roleProcess.RoleId,
        Active : roleProcess.Active,
        ProcessId : roleProcess.ProcessId
       };
    //    $scope.UiProcessRole.RoleName = roleProcess.RoleName;
    //    $scope.UiProcessRole.Description = roleProcess.Description;
    //    $scope.UiProcessRole.RoleId =  roleProcess.RoleId;
    //    $scope.UiProcessRole.Active = roleProcess.Active;
    //    $scope.UiProcessRole.ProcessId = roleProcess.ProcessId;
    };
    $scope.UpdateProcessRole = function()
    {
        $scope.ProcessRollDTO.RoleId = $scope.ProcessRoleId;
        $scope.ProcessRollDTO.ProcessIdOld = $scope.ProcessIdOld;
        $scope.UiProcessRole;
        $scope.UiProcessRole.RoleName = $scope.UiProcessRole.RoleName;
        $scope.UiProcessRole.Description =  $scope.UiProcessRole.Description;
            $http({
                method: "POST",
                url: urlMwServer + "/rest/UpdateProcessRole",
                data: angular.toJson($scope.UiProcessRole)
            }).then(function (responseUpdateProcess) {    
                if(responseUpdateProcess.data.TransactionStatus == true)
                {
                    Swal.fire("Correcto", "El proceso de actualización fue exitosa","success");
                    // $('#userRolesSelect').selectmenu('refresh', true);
                    // $scope.tabFormAddRoleProcess = false; 
                }
                else{
                    Swal.fire("Error",  responseUpdateProcess.data.ErrorMessage,"info");
                }
                $scope.processInit();
                
               }, function () {    
                Swal.fire("Error","Error en la petición hacia el servidor","warning");
            }); 
            
            
    };
    $scope.DeleteProcessRole = function(roleProcess)
    {
        $scope.ui = {};
        $scope.ui.Funtions = [];
        $scope.ui.RoleScrens =[];
        $scope.ui.Role = [];
        spinnerOn();
        $scope.UserSelect = 
        {
            RoleId : roleProcess.RoleId,
            IncludeLazy : true,
        }
       $http({
           method: "POST",
           url: urlMwServer + "/rest/GetUsers",
           data: angular.toJson($scope.UserSelect)
       }).then(function (result) {
          if(result.data.length>0){
            spinnerOff();
           Swal.fire("Advertencia!","No se puede eliminar el rol, se encuentra asignado","warning");
          }
          else
          {
              spinnerOff();
              $http({
                method: "POST",
                url: urlMwServer + "/rest/GetProcessRoles",
                data: angular.toJson($scope.UserSelect)
            }).then(function (result) {
               if(result.data.length > 0){
                   $scope.AuxRol = result.data;
                Swal.fire({
                    title: '¿Desea eliminar el Rol?',
                    text: "Se eliminara con las configuraciones!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si!'
                  }).then((result) => {
                    if (result.isConfirmed){
                    
                        $scope.AuxRol.forEach(item =>{
                            $scope.ui.Role.push(item);
                                item.ProcessRoleScreens.forEach(itemRoleScre =>{
                                    $scope.ui.RoleScrens.push(itemRoleScre);
                                    itemRoleScre.ProcessRoleScreenFunctions.forEach(itemFunction=>
                                        {
                                            $scope.ui.Funtions.push(itemFunction);
                                        });
                                });
                            });
                            $scope.ui.Funtions.forEach(itemFunction =>{
                                  $scope.DeleteScreenFunction(itemFunction);
                                });
                            $scope.ui.RoleScrens.forEach(itemScren =>{
                                $scope.DeleteRoleScreen(itemScren);
                            });
                            $scope.ui.Role.forEach(itemRole =>{
                                $scope.DeleteRole(itemRole);
                            });
                            
                            Swal.fire(
                                'Éxisto',
                                'se elimino el rol',
                                'warning'
                              )                         
                         spinnerOff();
                     }
                     
                  })
               }
            }, function myError(response) {
                Swal.fire(
                    'Error',
                    'Error de Servicio',
                    'warning'
                  )  
            });
              
          }
           
       }, function myError(response) {
           Swal.fire(
               'Error',
               'Error de Servicio',
               'warning'
             )  
       });
    };
    $scope.DesavtivateProcessRol = function(roleProcess,active)
    {
        spinnerOn();
        $scope.UserSelect = 
        {
            RoleId : roleProcess.RoleId,
           IncludeLazy : false,
        }
         
       $http({
           method: "POST",
           url: urlMwServer + "/rest/GetUsers",
           data: angular.toJson($scope.UserSelect)
       }).then(function (result) {
          if(result.data.length>0){
            spinnerOff();
           Swal.fire("Advertencia!","No se puede desactivar el rol, se encuentra asignado","warning");
          }else
          {
            roleProcess.Active = active;
            roleProcess.Process = null;
            roleProcess.ProcessRoleScreens =  null;
            spinnerOn();
            $http({
                method: "POST",
                url: urlMwServer + "/rest/UpdateProcessRole",
                data: angular.toJson(roleProcess)
            }).then(function (responseUpdateProcess) {    
                if(responseUpdateProcess.data.TransactionStatus == true)
                {
                    if(active == 0)
                    {
                        Swal.fire("Confirmación", "Se Desactivo el rol correctamente","success"); 
                    }else
                    {
                        Swal.fire("Confirmación", "Se Activo el rol correctamente","success"); 

                    }
                    GetProcessRole();
                    spinnerOff();
                }
                else{
                    Swal.fire('Error',responseUpdateProcess.data.ErrorMessage,'warning');
                    spinnerOff();
                }
                $scope.processInit();
                
               }, function (response) {   
                Swal.fire('Error','Error de Servicio','warning');
                  spinnerOff();
            }); 

     
          }
           
       }, function myError(response) {
           Swal.fire('Error','Error de Servicio','warning');  
       });
        
    };
    $scope.copiarUrl = function(id_elemento) {
        var aux = document.createElement("input");
        aux.setAttribute("value", document.getElementById(id_elemento).innerHTML);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
    };
    $scope.DeleteRoleScreen = function(Role)
    {
        spinnerOn();
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleteRoleScreen",
            data: angular.toJson(Role)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
               spinnerOff();
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
             Swal.fire('Erro Solicitud', result.data.ErrorMessage, 'error');
          }); 
    }
    $scope.DeleteScreenFunction = function(functionDto)
    {
        spinnerOn();
        $scope.screenFunctionDto ={
            FunctionId : functionDto.FunctionId,
        };
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleteRoleScreenFunction",
            data: angular.toJson($scope.screenFunctionDto)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                spinnerOff();
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
          });
    };
    $scope.DeleteRole = function(Role){
        spinnerOn();
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleRole",
            data: angular.toJson(Role)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                spinnerOff();
                $scope.responseRoleByProcess = [];
                GetProcessRole();
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
          });
    };
    
});
angularRoutingApp.controller('ScreendController', function ($scope, $http, $filter) {
    $scope.TypeId = 26;
    $scope.nsScreen = true;
    $scope.nsScreenFuntion = false;
    $scope.processId = 0;
    $scope.RoleId = 0;
    $scope.btnSaveScreen = true;
    $scope.btnUpdate = false;
    $scope.ProcessScreenDto = {};
    $scope.ngSelectScreenSection = false;
    $scope.ngBtnActualizar = false;
    $scope.ngBtnCrear = true;

    $scope.GetProcess = function () {
        spinnerOn();
        $scope.isRunningProcess = true;
        $http({
            method: "GET",
            url: urlMwServer + "/rest/GetProcess",
            params : {
                typeId : $scope.TypeId
            }
        }).then(function (result) {
            if (result.data != "") {
                spinnerOff();
                $scope.Process =  result.data;                
            } else{
                spinnerOff();
                Swal.fire('Advertencia', result.data.ErrorMessage, 'error');

            }
            
        }, function myError(response) {
            spinnerOff();
            Swal.fire('Error de petición',"Error de Petición GetProcess", 'error');
        });
    }
    $scope.SaveScreen = function(process,configurationScreen){
    
    $scope.auxSearch = $scope.filterListScreen.filter(d=>d.ScreenName == configurationScreen.ScreenName && d.Description ==configurationScreen.Description);
     
    if(configurationScreen.ScreenName != undefined && configurationScreen.Description != undefined){
        if($scope.auxSearch == "" || $scope.auxSearch ==  undefined) {
            $scope.ProcessScreenDto = {
                ProcessId : process.ProcessId,
                ScreenName : configurationScreen.ScreenName,
                Description : configurationScreen.Description
            };
            $scope.screenDtos = [];
            $scope.screenDtos.push($scope.ProcessScreenDto);
            $http({
                method: "POST",
                url: urlMwServer + "/rest/CreateProcessScreen",
                data: angular.toJson($scope.screenDtos)
                
            }).then(function (result) {
                if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                    $scope.isRunningProcess = false; 
                    $scope.GetScreen(); 
                    $scope.ProcessScreenDto = {};
                    // $scope.GetProcess(); 
                    Swal.fire('Pantalla creada', 'Se creo correctamente', 'success'); 
                } else{
                    Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                    $scope.isRunningProcess = false;
                }
              }, function myError(response) {
                 $scope.isRunningProcess = false;
                 Swal.fire('Error de servicio', 'Error al realizar solicitud', 'error'); 
            });
        }else
        {
            Swal.fire('Advertencia!!', 'El registro ya existe', 'warning'); 
        }
        
    }
  
    }
    $scope.changeProcess = function(ProcessId)
    { 
      if(ProcessId != null)
      {
        $scope.ngBtnCrear = true;
        $scope.ngSelectScreenSection = false;
        $scope.ProcessId = ProcessId;
        $scope.GetScreen();
        $scope.filterListScreen = [];
        $scope.filterListScreenSection  = [];
      }else
      {
        $scope.ngSelectScreenSection = false;
        $scope.ngBtnCrear = true;
        $scope.filterListScreen = [];
        $scope.filterListScreenSection  = [];
      }
    };
    $scope.GetScreen = function()
    {
        if($scope.ProcessId != undefined){
            spinnerOn();
            $scope.processScreen = {
                ProcessId : $scope.ProcessId,
                IncludeLazy : false
            };
            $scope.isRunningProcess = true;
            $http({
                method: "POST",
                url: urlMwServer + "/rest/GetScreen",
                data: angular.toJson($scope.processScreen)
            }).then(function (result) {
               
                    $scope.editUser = true;
                    $scope.deleteUser = true;
                    $scope.screens = result.data;
                    $scope.perPage = 10;
                    $scope.maxSize = 5;  
                    $scope.$watch('searchText', function (term) {
                        var obj = term;
                        $scope.filterListScreen = $filter('filter')($scope.screens, obj);
                        $scope.currentPage = 1;
                    });   
    
                    spinnerOff();
                    
            }, function myError(response) {
    
                    alert('Busca SPA', 'Error al realizar solicitud', 'error');
            });
        }
     
    };
    $scope.DeleteScreen = function(screen)
    {
        Swal.fire({
            title: '¿Desea eliminar el registro?',
            text: "Se eliminara el registro con las configuraciones",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si'
          }).then((result) => {
            if (result.isConfirmed) {
            spinnerOn();
            $scope.processScreenDto = {
                ProcessId : screen.ProcessId,
                ScreenId : screen.ScreenId,
                IncludeLazy : true
            };
            $http({
                method: "POST",
                url: urlMwServer + "/rest/GetScreen",
                data: angular.toJson($scope.processScreenDto)
            }).then(function (result) {
                $scope.AuxScreeDtos = result.data;

                if($scope.AuxScreeDtos[0].ProcessScreenSections.length == 0){
                   $scope.AuxScreenRole = {
                    ScreenId : $scope.AuxScreeDtos[0].ScreenId,
                    ProcessId : $scope.AuxScreeDtos[0].ProcessId,
                    IncludeLazy : false
                   };
                 spinnerOn();
                    $http({
                        method: "POST",
                        url: urlMwServer + "/rest/GetRoleScreen",
                        data : angular.toJson($scope.AuxScreenRole)
                    }).then(function (result) {
                      
                        result.data.forEach(item=>{
                            $scope.DeleteRoleScreenDto(item);
                        });
                        $scope.ExecuteDeleteScreen(screen);
                        spinnerOff();
            
                    }, function myError(response) {
                        Swal.fire('Error', 'Error al realizar solicitud', 'error');
                        spinnerOff();
                    });

                }else{
                    Swal.fire('Advertencia!!!', 'Favor de eliminar la funciones por pantalla', 'warning');
                }
               spinnerOff();
            }, function myError(response) { 
                Swal.fire('Error', 'Error al realizar solicitud', 'error');
            });
         }
        });
        
    };
    $scope.ExecuteDeleteScreen = function(screen)
    {
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleteScreen",
            data: angular.toJson(screen)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                $scope.GetScreen();
                Swal.fire('Pantalla eliminada', 'Se elimino correctamente', 'success');
    
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                $scope.isRunningProcess = false;
            }
          }, function myError(response) {
             $scope.isRunningProcess = false;
             alert('Busca SPA', 'Error al realizar solicitud', 'error');
          });
    };
    $scope.DeleteScreenFunction = function(functionDto)
    {
        spinnerOn();
        $scope.screenFunctionDto ={
            FunctionId : functionDto.FunctionId,
        };
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleteRoleScreenFunction",
            data: angular.toJson($scope.screenFunctionDto)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                spinnerOff();
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
          });
    };
    $scope.EditScreen = function(screen)
    { 
        $scope.btnSaveScreen = false;
        $scope.btnUpdate = true;
        $scope.ProcessScreenDto = {};
        $scope.ProcessScreenDto.ScreenName = screen.ScreenName;
        $scope.ProcessScreenDto.Description = screen.Description;
        $scope.ProcessScreenDto.ScreenId = screen.ScreenId;
    };
    $scope.btnCancelar = function()
    {
        $scope.ProcessScreenDto = {};  
        $scope.btnSaveScreen = true;
        $scope.btnUpdate = false;  
    };
    $scope.UpdateScreen = function(process,configurationScreen)
    {
        $scope.ProcessScreenDto = {
            ProcessId : process.ProcessId,
            ScreenName : configurationScreen.ScreenName,
            Description : configurationScreen.Description,
            ScreenId : $scope.ProcessScreenDto.ScreenId
        };

        $http({
            method: "POST",
            url: urlMwServer + "/rest/UpdateScreen",
            data: angular.toJson($scope.ProcessScreenDto)
            
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                $scope.isRunningProcess = false; 
                $scope.GetScreen(); 
                $scope.ProcessScreenDto = {};
                Swal.fire('Pantalla Actualizada', 'Se creo correctamente', 'success'); 
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                $scope.isRunningProcess = false;
            }
          }, function myError(response) {
             $scope.isRunningProcess = false;
             Swal.fire('Error de servicio', 'Error al realizar solicitud', 'error'); 
          });
    };
    $scope.CreateScreenSections = function(screenSectionDto)
    { 
        if(screenSectionDto.Name !=  undefined){
            $scope.FilterAUX =  $scope.filterListScreenSection.filter(x=>x.Name == screenSectionDto.Name)[0]
            if( $scope.FilterAUX == null){
              $scope.processScreenSectionDtos = [];
              $scope.processScreenSectionDtos.push(
                  $scope.processScreenSection = {
                  ProcessId : screenSectionDto.ProcessId,
                  ScreenId : screenSectionDto.ScreenId,
                  Name :  screenSectionDto.Name
              });
              $http({
                  method: "POST",
                  url: urlMwServer + "/rest/CreateScreenSections",
                  data: angular.toJson($scope.processScreenSectionDtos)
                  
              }).then(function (result) {
                  if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                      $scope.GetScreenSection(); 
                      $scope.processScreenSection = {};
                      Swal.fire('Sección creada', 'Se creo correctamente', 'success'); 
                  } else{
                      Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                  }
                }, function myError(response) {
                   $scope.isRunningProcess = false;
                   Swal.fire('Error de servicio', 'Error al realizar solicitud', 'error'); 
                });
           }else{
              Swal.fire('Sección existe', 'Favor de validar', 'warning');
           }
        }

      
    };
    $scope.changeScreenSenction = function(screenSectionDto){
        if(screenSectionDto !=  null)
        {
            $scope.ngSelectScreenSection = false;
            $scope.ScreenSectionDTO = {
                ProcessId : screenSectionDto.ProcessId,
                ScreenId :  screenSectionDto.ScreenId,
                IncludeLazy : false
            };
            $scope.GetScreenSection();
        }else{
            $scope.ngSelectScreenSection = false;
            $scope.filterListScreenSection = [];
        }

        
    };
    $scope.GetScreenSection = function(){

        if($scope.ScreenSectionDTO.ProcessId != undefined){
            spinnerOn();
            $scope.processScreenSectionDto = {
                ProcessId :  $scope.ScreenSectionDTO.ProcessId,
                ScreenId :   $scope.ScreenSectionDTO.ScreenId,
                IncludeLazy : false
            };
            $http({
                method: "POST",
                url: urlMwServer + "/rest/GetScreenSection",
                data: angular.toJson($scope.processScreenSectionDto)
            }).then(function (result) {
            
                    $scope.screenSection = result.data;
                    $scope.perPage = 10;
                    $scope.maxSize = 5;  
                    $scope.$watch('searchText', function (term) {
                        var obj = term;
                        $scope.filterListScreenSection = $filter('filter')($scope.screenSection, obj);
                        $scope.currentPage = 1;
                    });   
    
                    spinnerOff();
                    
            }, function myError(response) {
                Swal.fire('Error', 'Error al realizar solicitud', 'error');
            });
        }else
        {
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
        }
     
    };
    $scope.DeleteScreenSection = function(screenSenctionDtos){
        spinnerOn();
        $scope.seleteScreenSectionDtos ={
            ProcessId : screenSenctionDtos.ProcessId,
            ScreenId : screenSenctionDtos.ScreenId,
            Name : screenSenctionDtos.Name
        };
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetRoleScreenFunctions",
            data: angular.toJson($scope.seleteScreenSectionDtos)
        }).then(function (result) {
        
            if (result.data.length > 0 ) {
                $scope.ListFunction = result.data;
                $scope.seleteScreenSectionDto = {
                    ProcessId : screenSenctionDtos.ProcessId,
                    ScreenId : screenSenctionDtos.ScreenId,
                    Name : screenSenctionDtos.Name,
                    FunctionId : result.data[0].FunctionId
                };
                spinnerOff();
                Swal.fire({
                    title: '¿Desea Eliminar el registro con la configuración?',
                    text: "El registro se encuentro configurado",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si'
                  }).then((result) => {
                    if (result.isConfirmed) {
                        $scope.ListFunction.forEach(item=>{
                            $http({
                                method: "POST",
                                url: urlMwServer + "/rest/DeleteRoleScreenFunction",
                                data: angular.toJson(item)
                            }).then(function (result) {
                                if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {                    
                                } else{
                                    // Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                                    spinnerOff();
                                }
                            }, function myError(response) {
                                Swal.fire('Error', 'Error al realizar solicitud', 'error');
                                spinnerOff();
                            });
                        });
                        $http({
                            method: "POST",
                            url: urlMwServer + "/rest/DeleteScreenSection",
                            data: angular.toJson($scope.seleteScreenSectionDtos)
                        }).then(function (result) {
                            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                                Swal.fire('Éxito', 'Se elimino correctamente', 'success');
                                $scope.GetScreenSection();
                               spinnerOff();
                            } else{
                                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                                spinnerOff();
                            }
                        }, function myError(response) {
                            Swal.fire('Error', 'Error al realizar solicitud', 'error');
                            spinnerOff();
                        });
                    }
                        
                }, function myError(response) {
                    Swal.fire('Error', 'Error al realizar solicitud', 'error');
                    spinnerOff();
                });
         }else{
            $http({
                method: "POST",
                url: urlMwServer + "/rest/DeleteScreenSection",
                data: angular.toJson($scope.seleteScreenSectionDtos)
            }).then(function (result) {
            
                if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                    Swal.fire('Éxito', 'Se elimino correctamente', 'success');
                    $scope.GetScreenSection();
                   spinnerOff();
                } else{
                    Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                    spinnerOff();
                }
                    
            }, function myError(response) {
                Swal.fire('Error', 'Error al realizar solicitud', 'error');
                spinnerOff();
    
            });
         }
       });
    };
    $scope.EditScreenSection = function(screenSenctionDtos)
    {
        $scope.ngBtnActualizar = true;
        $scope.ngSelectScreenSection = true;
        $scope.ngBtnCrear = false;

        $scope.screenSectionDto = {
            ScreenSectionId : screenSenctionDtos.ScreenSectionId,
            ProcessId : screenSenctionDtos.ProcessId,
            ScreenId : screenSenctionDtos.ScreenId,
            Name : screenSenctionDtos.Name
        };
        
         spinnerOn();
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetRoleScreenFunctions",
            data: angular.toJson($scope.screenSectionDto)
        }).then(function (result) {
               if(result.data.length > 0){
                   $scope.screendDtos = result.data;
                   spinnerOff();

               }
               spinnerOff();

        }, function myError(response) {
            spinnerOff();

            Swal.fire('Error', 'Error al realizar solicitud', 'error');
        });
    };
    $scope.Canceled = function()
    {
        $scope.ngBtnActualizar = false;
        $scope.ngSelectScreenSection = false;
        $scope.ngBtnCrear = true;  
        $scope.screenSectionDto = {};
    };
    $scope.Update = function()
    {
        spinnerOn();
        $scope.screenSectionDto;
        if($scope.screendDtos != null){
            $scope.screendDtos.forEach(item=>
                {
                    item.Name = $scope.screenSectionDto.Name;
                    $http({
                        method: "POST",
                        url: urlMwServer + "/rest/UpdateRoleScreenFunction",
                        data: angular.toJson(item)
                    }).then(function (result) {
                        if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                            spinnerOff();
                        } else{
                            Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                            spinnerOff();
                        }
                            
                    }, function myError(response) {
                        Swal.fire('Error', 'Error al realizar solicitud', 'error');
                        spinnerOff();
            
                    });
                });
            $http({
                method: "POST",
                url: urlMwServer + "/rest/UpdateScreenSection",
                data: angular.toJson($scope.screenSectionDto)
            }).then(function (result) {
            
                if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                    Swal.fire('Éxito', 'Se Actualizo correctamente', 'success');
                    $scope.GetScreenSection();
                   spinnerOff();
                } else{
                    Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                    spinnerOff();
                }
                    
            }, function myError(response) {
                Swal.fire('Error', 'Error al realizar solicitud', 'error');
                spinnerOff();
    
            });
        }else{
            $http({
                method: "POST",
                url: urlMwServer + "/rest/UpdateScreenSection",
                data: angular.toJson($scope.screenSectionDto)
            }).then(function (result) {
            
                if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                    Swal.fire('Éxito', 'Se Actualizo correctamente', 'success');
                    $scope.GetScreenSection();
                   spinnerOff();
                } else{
                    Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                    spinnerOff();
                }
                    
            }, function myError(response) {
                Swal.fire('Error', 'Error al realizar solicitud', 'error');
                spinnerOff();
    
            });
        }

        
    };
    $scope.DeleteRoleScreenDto = function(Role)
    {
        spinnerOn();
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleteRoleScreen",
            data: angular.toJson(Role)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                $scope.GetScreenRolesByProcessId();
                Swal.fire('Pantalla eliminada', 'Se elimino correctamente', 'success');
               spinnerOff();
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
             Swal.fire('Erro Solicitud', result.data.ErrorMessage, 'error');
          }); 
    }
   
});
angularRoutingApp.controller('SpaByRolController', function ($scope, $http, $filter) {
    $scope.TypeId = 26;
    $scope.nsScreen = true;
    $scope.nsScreenFuntion = false;
    $scope.processId = 0;
    $scope.RoleId = 0;
    $scope.btnSaveScreen = true;
    $scope.btnUpdate = false;
    $scope.ProcessScreenDto = {};   
  
    $scope.GetRoles = function()
    {
        spinnerOn();
        $scope.processRoleDto = {};
        $scope.processRoleDto.IncludeLazy = true;
        $scope.isRunningProcess = true;
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetProcessRoles",
            data: angular.toJson($scope.processRoleDto)
        }).then(function (result) {
            
                $scope.editUser = true;
                $scope.deleteUser = true;
                $scope.Roles = result.data;
                $scope.perPage = 10;
                $scope.maxSize = 5;  
                $scope.$watch('searchText', function (term) {
                    var obj = term;
                    $scope.filterList = $filter('filter')($scope.Roles, obj);
                    $scope.currentPage = 1;
                });   
                spinnerOff();
        }, function myError(response) {
            spinnerOff();
                 Swal.fire('Error', 'Error al realizar solicitud', 'error');
        });
    }
    $scope.changeRole = function(processId,RoleId)
    {
        $scope.processId = processId;
        $scope.RoleId = RoleId;
        $scope.GetScreenByProcessId(processId);
        $scope.GetScreenRolesByProcessId(processId,RoleId);
    }
    $scope.GetScreenByProcessId = function(processId)
    {
        spinnerOn();
        $scope.ProcessScreen = 
        {
            ProcessId : processId
        }
        $scope.isRunningProcess = true;
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetScreen",
            data: angular.toJson($scope.ProcessScreen)

        }).then(function (result) {
            spinnerOff();
                $scope.Screenprocess = result.data;
        }, function myError(response) {
            spinnerOff();
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
             $scope.isRunningProcess = false;  
        });
    }
    $scope.GetScreenRolesByProcessId = function(processId,RoleId)
    { 
        spinnerOn();
           if(processId != undefined && RoleId != undefined)
           {
            $scope.isRunninScreenRole = true;
            $scope.ScreenRole = {};
            $scope.ScreenRole.ProcessId = processId;
            $scope.ScreenRole.RoleId = RoleId ;
            $scope.ScreenRole.IncludeLazy = true;
            $scope.ScreenRole.ProcessRoleScreenFunctions = null;
           }
        
        $http({
            method: "POST",
            url: urlMwServer + "/rest/GetRoleScreen",
            data : angular.toJson($scope.ScreenRole)
           
        }).then(function (result) {
          
                $scope.editUser = true;
                $scope.deleteUser = true;
                $scope.RoleScrenns = result.data;
                $scope.perPage = 10;
                $scope.maxSize = 5;  
                $scope.$watch('searchText', function (term) {
                    var obj = term;
                    $scope.filterListRolesScreen = $filter('filter')($scope.RoleScrenns, obj);
                    $scope.currentPage = 1;
                });   
                spinnerOff();

        }, function myError(response) {
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
            spinnerOff();
        });
    }
    $scope.SaveScreenRole = function(roles,screen)
    {

       $scope.AuxFiler = $scope.filterListRolesScreen.filter(d=>d.ProcessId = roles.ProcessId 
            && d.RoleId == roles.RoleId && d.ScreenId ==screen.ScreenId)[0];

        if($scope.AuxFiler == null){
            spinnerOn();
            $scope.processRoleScreenDto ={
                RoleId : roles.RoleId,
                ProcessId : roles.ProcessId,
                ScreenId : screen.ScreenId,
            };
            $scope.roleScreenDto = [];
            $scope.roleScreenDto.push($scope.processRoleScreenDto);
            $http({
                method: "POST",
                url: urlMwServer + "/rest/CreateProcessRoleScreen",
                data: angular.toJson($scope.roleScreenDto)
                
            }).then(function (result) {
                if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                     spinnerOff();
                    $scope.GetScreenRolesByProcessId();
                    Swal.fire('Pantalla creada', 'Se creo correctamente', 'success');
                    spinnerOff();
    
                } else{
                    Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                    spinnerOff();
                }
              }, function myError(response) {
                spinnerOff();
                 Swal.fire('Error', 'Error al realizar solicitud', 'error');
              });
        }else{
            Swal.fire('Advertencia', 'Registro existente', 'warning');

        }
  
        
    };
    $scope.DeleteRoleScreen = function(Role)
    {
        spinnerOn();
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleteRoleScreen",
            data: angular.toJson(Role)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                $scope.GetScreenRolesByProcessId();
                Swal.fire('Pantalla eliminada', 'Se elimino correctamente', 'success');
               spinnerOff();
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
             Swal.fire('Erro Solicitud', result.data.ErrorMessage, 'error');
          }); 
    }
    $scope.UpdateScreen = function(process,configurationScreen)
    {
        spinnerOn();
        $scope.ProcessScreenDto = {
            ProcessId : process.ProcessId,
            ScreenName : configurationScreen.ScreenName,
            Description : configurationScreen.Description,
            ScreenId : $scope.ProcessScreenDto.ScreenId
        };

        $http({
            method: "POST",
            url: urlMwServer + "/rest/UpdateScreen",
            data: angular.toJson($scope.ProcessScreenDto)
            
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                spinnerOff();
                $scope.GetScreen(); 
                $scope.ProcessScreenDto = {};
                Swal.fire('Pantalla Actualizada', 'Se creo correctamente', 'success'); 
            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
            Swal.fire('Error de servicio', 'Error al realizar solicitud', 'error'); 
          });
    }
    $scope.SaveScreenRoleFucntion = function(rolesFuction,screenRolesDtos)
    {

       $scope.AuxFilterSearch  = $scope.filterListScreenRoleFunction.filter(x=>x.Name ==screenRolesDtos.Name)[0];
       if( $scope.AuxFilterSearch == null){
        spinnerOn();
        $scope.FunctionDto = [];
        $scope.processRoleScreenFunctionDto ={
            RoleScreenId : rolesFuction.RoleScreenId,
            Name : screenRolesDtos.Name,
            RoleId : rolesFuction.RoleId,
            ScreenId :rolesFuction.ScreenId,
            ProcessId : rolesFuction.ProcessId
        };
        $scope.FunctionDto.push($scope.processRoleScreenFunctionDto);
        $http({
            method: "POST",
            url: urlMwServer + "/rest/CreateProcessRoleScreenFunctions",
            data: angular.toJson($scope.FunctionDto)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                $scope.isRunningProcess = false; 
                $scope.GetScreenRoleFucntion($scope.processRoleScreenFunctionDto);
                Swal.fire('Éxito', 'Se creo correctamente', 'success');
                spinnerOff();

            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
          });

       }else{
        Swal.fire('Advertencia', 'Registro existente en la cofiguración', 'warning');

       }
     
      
    }
    $scope.GetScreenRoleFucntion = function(rolesFuction){ 
        spinnerOn();
        if(rolesFuction  != null){
            $scope.screenFunctionDto = 
            {
                RoleId : rolesFuction.RoleId,
                ProcessId : rolesFuction.ProcessId,
                RoleScreenId : rolesFuction.RoleScreenId,
                ScreenId : rolesFuction.ScreenId
            }
            $scope.GetScreenSection();
            $http({
                method: "POST",
                url: urlMwServer + "/rest/GetRoleScreenFunctions",
                data: angular.toJson($scope.screenFunctionDto)
            }).then(function (result) {
                if (result.data.length>0 ) {
    
                    $scope.editUser = true;
                    $scope.deleteUser = true;
                    $scope.screenRoleFunction = result.data;
                    $scope.perPage = 10;
                    $scope.maxSize = 5;  
                    $scope.$watch('searchText', function (term) {
                        var obj = term;
                        $scope.filterListScreenRoleFunction = $filter('filter')($scope.screenRoleFunction, obj);
                        $scope.currentPage = 1;
                    });  
                    spinnerOff();
                } else{
                    $scope.screenRoleFunction = [];
                    $scope.filterListScreenRoleFunction = [];
                    Swal.fire('No existen registros', 'No existe registros', 'warning');
                    spinnerOff();
                }
              }, function myError(response) {
                spinnerOff();
                Swal.fire('Error', 'Error al realizar solicitud', 'error');
              });
        }else
        {
            $scope.filterListScreenRoleFunction = [];
            // $scope.screeSectiondtos = [];
            spinnerOff();
        }
       
    };
    $scope.DeleteScreenFunction = function(functionDto)
    {
        spinnerOn();
        $scope.screenFunctionDto ={
            FunctionId : functionDto.FunctionId,
        };
        $http({
            method: "POST",
            url: urlMwServer + "/rest/DeleteRoleScreenFunction",
            data: angular.toJson($scope.screenFunctionDto)
        }).then(function (result) {
            if (result.data.TransactionStatus == true && result.data.ErrorMessage == null ) {
                spinnerOff();
                $scope.GetScreenRoleFucntion(functionDto);
                Swal.fire('Fución Eliminada', 'Se elimino correctamente', 'success');

            } else{
                Swal.fire('Confirmado', result.data.ErrorMessage, 'error');
                spinnerOff();
            }
          }, function myError(response) {
            spinnerOff();
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
          });
    }
    $scope.GetScreenSection = function(){

        if($scope.screenFunctionDto.ProcessId != undefined){
            spinnerOn();
            $scope.processScreenSectionDto = {
                ProcessId :  $scope.screenFunctionDtoProcessId,
                ScreenId :   $scope.screenFunctionDto.ScreenId,
                IncludeLazy : false
            };
            $http({
                method: "POST",
                url: urlMwServer + "/rest/GetScreenSection",
                data: angular.toJson($scope.processScreenSectionDto)
            }).then(function (result) {
            
                   $scope.screeSectiondtos =  result.data;    
                    spinnerOff();
                    
            }, function myError(response) {
                Swal.fire('Error', 'Error al realizar solicitud', 'error');
            });
        }else
        {
            Swal.fire('Error', 'Error al realizar solicitud', 'error');
        }
     
    };
    
    
   
});
angularRoutingApp.filter('start', function () {
    return function (input, start) {
        if (!input || !input.length) { return; }
        start = +start;
        return input.slice(start);
    };
});
angularRoutingApp.controller('dashboardController', function ($scope, $http, $interval) {
    $('#vertical-menu').show();
    document.getElementById("vertical-menu").removeAttribute("style");
    $('#page-topbar').show();
    $('#searchDevice').hide();
    $('#searchOptions').hide();
    $('#operationsByDevice').hide();
    $('#page-header-search-dropdown').hide();
    $('#suggestionBoxMenu').hide();

    $scope.days = "0";
    $scope.finalDate = new Date();
    $scope.initialDate = new Date();
    $scope.macByMetro = 0;
    $scope.macByInterior = 0;
    $scope.macByNorte = 0;
    $scope.macByZequence = 0;
    $scope.reporterHeaderDTO = [];
    $scope.dataOperations = [];
    $scope.pingData = [];
    $scope.pingTotal = 0;
    $scope.wifiData = [];
    $scope.wifiTotal = 0;
    $scope.speedData = [];
    $scope.speedTotal = 0;
    $scope.interiorData = [];
    $scope.interiorTotal = 0;
    $scope.metroData = [];
    $scope.metroTotal = 0;
    $scope.norteData = [];
    $scope.norteTotal = 0;
    $scope.zequenceData = [];
    $scope.zequenceTotal = 0;
    $scope.sessionData = [];
    $scope.detailBySession = [];
    $scope.macData = [];
    $scope.macIData = [];
    $scope.macMData = [];
    $scope.macNData = [];
    $scope.macZData = [];
    $scope.detailByInstance = [];
    $scope.searchBySession = "";
    $scope.instance = "";
    $scope.searchByFilter = "";
    //$scope.perPage = 5;
    var fechas = [];
    var totales = [];
    var x = [];
    var y = [];
    document.getElementById("switchZequence").checked = true;
    document.getElementById("zequenceOption").checked = true;
     initDashboard();
    function createGraphLine(dom2, fechas, totales, name) {
        var myChart = echarts.init(dom2);
        var app = {};
        option = null;
        option = {
            grid: {
                zlevel: 0,
                x: 50,
                x2: 50,
                y: 30,
                y2: 30,
                borderWidth: 0,
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'rgba(0,0,0,0)',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            xAxis: {
                type: 'category',
                data: fechas,
                axisLine: {
                    lineStyle: {
                        color: '#8791af'
                    },
                },
            }, 
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#8791af'
                    },
                },
                splitLine: {
                    lineStyle: {
                        color: "rgba(166, 176, 207, 0.1)"
                    }
                }
            },
            series: [{
                data: totales,
                type: 'line'
            }],
            color: ['#556ee6'],
        };
        ;
        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    }
    function cretaeGraphByInstance(dom,data) {
        var myChart = echarts.init(dom);
        var app = {};
        option = null;

        option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['Ping', 'Speed Test', 'Consulta Wifi'],
                textStyle: { color: '#8791af' }
            },
            color: ['#d22176', '#f47e28', '#00b0ac'],
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: [
                        {
                            value: data.find(item => item.Tipo.match('Ping')) != undefined ? data.find(item => item.Tipo.match('Ping')).RegistrosTotales : 0,
                            name: 'Ping'
                        },
                        {
                            value: data.find(item => item.Tipo.match('SpeedTest')) != undefined ? data.find(item => item.Tipo.match('SpeedTest')).RegistrosTotales : 0,
                            name: 'Speed Test'
                        },
                        {

                            value: data.find(item => item.Tipo.match('ConsultaWifi')) != undefined ? data.find(item => item.Tipo.match('ConsultaWifi')).RegistrosTotales : 0,
                            name: 'Consulta Wifi'
                        }
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    }
    function createGraph(dom, data) {
        var myChart = echarts.init(dom);
        var app = {};
        option = null;

        option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {d}% ({c})"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data: ['Interior', 'Metro', 'Norte', 'Zequence'],
                textStyle: { color: '#8791af' }
            },
            color: ['#d22176', '#f47e28', '#00b0ac', '#ffd218'],
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                    emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '20',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: data.find(item => item.Instancia.match('I')) != undefined ? data.find(item => item.Instancia.match('I')).RegistrosTotales : 0,
                            name: 'Interior'
                        },
                        {
                            value: data.find(item => item.Instancia.match('M')) != undefined ? data.find(item => item.Instancia.match('M')).RegistrosTotales : 0,
                            name: 'Metro'
                        },
                        {
                            value: data.find(item => item.Instancia.match('T')) != undefined ? data.find(item => item.Instancia.match('T')).RegistrosTotales : 0,
                            name: 'Norte'
                        },
                        {
                            value: data.find(item => item.Instancia.match('Z')) != undefined ? data.find(item => item.Instancia.match('Z')).RegistrosTotales : 0,
                            name: 'Zequence'
                        }
                    ]
                }
            ]
        };

        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    }
    function createGraphOperations(dom, data) {
        var myChart = echarts.init(dom);
        var app = {};
        option = null;

        option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {d}% ({c})"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data: ['Cambio de contraseña', 'Cambio SSID', 'Reinicio', 'BandSteering'],
                textStyle: { color: '#8791af' }
            },
            color: ['#d22176', '#f47e28', '#00b0ac', '#ffd218'],
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '10',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: data.find(item => item.Tipo.match('ChangeSecurity')) != undefined ? data.find(item => item.Tipo.match('ChangeSecurity')).RegistrosTotales : 0,
                            name: 'Cambio de contraseña'
                        },
                        {
                            value: data.find(item => item.Tipo.match('ChangeSSIDName')) != undefined ? data.find(item => item.Tipo.match('ChangeSSIDName')).RegistrosTotales : 0,
                            name: 'Cambio SSID'
                        },
                        {
                            value: data.find(item => item.Tipo.match('Reinicio')) != undefined ? data.find(item => item.Tipo.match('Reinicio')).RegistrosTotales : 0,
                            name: 'Reinicio'
                        },
                        {
                            value: data.find(item => item.Tipo.match('TurnOnWirelessBand')) != undefined ? data.find(item => item.Tipo.match('TurnOnWirelessBand')).RegistrosTotales : 0,
                            name: 'BandSteering'
                        }
                    ]
                }
            ]
        };

        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    }
    $scope.selectedMetro = function () {
        if (document.getElementById("switchMetro").checked == true) {
            document.getElementById("switchInterior").checked = false;
            document.getElementById("switchNorte").checked = false;
            document.getElementById("switchZequence").checked = false;
            $scope.macData = [];
            fechas = [];
            totales = [];
            $scope.macData = $scope.macMData;
            x = $scope.macMData.reduce(function (obj, i) {
                obj[i.Fecha] = i.Fecha;
                return obj;
            }, {});
            XAtributes = Object.values(x);
            XAtributes.forEach(function (data, index) {
                fechas.push(data);
            });
            y = $scope.macMData.reduce(function (obj, i) {
                obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                return obj;
            }, {});
            YAtributes = Object.values(y);
            YAtributes.forEach(function (data, index) {
                totales.push(data);
            });
            createGraphLine(document.getElementById("chartMac"), fechas.sort(), totales.sort(), '');
        } else {
            document.getElementById("switchMetro").checked = true;
            $scope.macData = [];
        }
    }
    $scope.selectedInterior = function () {
        if (document.getElementById("switchInterior").checked == true) {
            document.getElementById("switchMetro").checked = false;
            document.getElementById("switchNorte").checked = false;
            document.getElementById("switchZequence").checked = false;
            $scope.macData = [];
            fechas = [];
            totales = [];
            $scope.macData = $scope.macIData;
            x = $scope.macIData.reduce(function (obj, i) {
                obj[i.Fecha] = i.Fecha;
                return obj;
            }, {});
            XAtributes = Object.values(x);
            XAtributes.forEach(function (data, index) {
                fechas.push(data);
            });
            y = $scope.macIData.reduce(function (obj, i) {
                obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                return obj;
            }, {});
            YAtributes = Object.values(y);
            YAtributes.forEach(function (data, index) {
                totales.push(data);
            });
            createGraphLine(document.getElementById("chartMac"), fechas.sort(), totales.sort(), '');
        } else {
            document.getElementById("switchInterior").checked = true;
            $scope.macData = [];
        }
    }
    $scope.selectedNorte = function () {
        if (document.getElementById("switchNorte").checked == true) {
            document.getElementById("switchMetro").checked = false;
            document.getElementById("switchInterior").checked = false;
            document.getElementById("switchZequence").checked = false;
            $scope.macData = [];
            fechas = [];
            totales = [];
            $scope.macData = $scope.macNData;
            x = $scope.macNData.reduce(function (obj, i) {
                obj[i.Fecha] = i.Fecha;
                return obj;
            }, {});
            XAtributes = Object.values(x);
            XAtributes.forEach(function (data, index) {
                fechas.push(data);
            });
            y = $scope.macNData.reduce(function (obj, i) {
                obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                return obj;
            }, {});
            YAtributes = Object.values(y);
            YAtributes.forEach(function (data, index) {
                totales.push(data);
            });
            createGraphLine("#chartMac", fechas.sort(), totales.sort(), '');
        } else {
            document.getElementById("switchNorte").checked = true;
            $scope.macData = [];
        }
    }
    $scope.selectedZequence = function () {
        if (document.getElementById("switchZequence").checked == true) {
            document.getElementById("switchMetro").checked = false;
            document.getElementById("switchInterior").checked = false;
            document.getElementById("switchNorte").checked = false;
            $scope.macData = [];
            fechas = [];
            totales = [];
            $scope.macData = $scope.macZData;
            x = $scope.macZData.reduce(function (obj, i) {
                obj[i.Fecha] = i.Fecha;
                return obj;
            }, {});
            XAtributes = Object.values(x);
            XAtributes.forEach(function (data, index) {
                fechas.push(data);
            });
            y = $scope.macZData.reduce(function (obj, i) {
                obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                return obj;
            }, {});
            YAtributes = Object.values(y);
            YAtributes.forEach(function (data, index) {
                totales.push(data);
            });
            createGraphLine(document.getElementById("chartMac"), fechas.sort(), totales.sort(), '');
        } else {
            document.getElementById("switchZequence").checked = true;
            $scope.macData = [];
        }
    }
    $scope.selectedByZ = function () {
        if (document.getElementById("zequenceOption").checked == true) {
            document.getElementById("metroOption").checked = false;
            document.getElementById("interiorOption").checked = false;
            document.getElementById("norteOption").checked = false;
        } else {
            $scope.instance = "";
            $scope.detailByInstance = {};
        }
    }
    $scope.selectedByN = function () {
        if (document.getElementById("norteOption").checked == true) {
            document.getElementById("metroOption").checked = false;
            document.getElementById("interiorOption").checked = false;
            document.getElementById("zequenceOption").checked = false;
        } else {
            $scope.instance = "";
            $scope.detailByInstance = [];
        }
    }
    $scope.selectedByI = function () {
        if (document.getElementById("interiorOption").checked == true) {
            document.getElementById("metroOption").checked = false;
            document.getElementById("norteOption").checked = false;
            document.getElementById("zequenceOption").checked = false;
        } else {
            $scope.instance = "";
            $scope.detailByInstance = [];
        }
    }
    $scope.selectedByM = function () {
        if (document.getElementById("metroOption").checked == true) {
            document.getElementById("interiorOption").checked = false;
            document.getElementById("zequenceOption").checked = false;
        } else {
            $scope.instance = "";
            $scope.detailByInstance = [];
        }
    }
    $scope.submitBySessionFilter = function () {
        $scope.detailBySession = [];
        $scope.sessionData.forEach(function (list, i) {
            if (list.Fecha.match($scope.searchBySession) || list.RegistrosTotales.toString().match($scope.searchBySession)) {
                $scope.detailBySession.push(list);
            }
        });
    }
    $scope.submitByFilter = function () {
        $scope.detailByInstance = [];
        $scope.instance = '';
        if (document.getElementById("zequenceOption").checked == true) {
            $scope.zequenceData.forEach(function (list, i) {
                if (list.Tipo.toUpperCase().match($scope.searchByFilter.toUpperCase()) || list.Fecha.toString().match($scope.searchByFilter) || list.RegistrosTotales.toString().match($scope.searchByFilter)) {
                    $scope.instance = 'Zequence';
                    $scope.detailByInstance.push(list);
                }
            });
           
        } else if (document.getElementById("interiorOption").checked == true) {
            $scope.interiorData.forEach(function (list, i) {
                if (list.Tipo.toUpperCase().match($scope.searchByFilter.toUpperCase()) || list.Fecha.toString().match($scope.searchByFilter) || list.RegistrosTotales.toString().match($scope.searchByFilter)) {
                    $scope.instance = 'Interior';
                    $scope.detailByInstance.push(list);
                }
            });
        } else if (document.getElementById("metroOption").checked == true) {
            $scope.metroData.forEach(function (list, i) {
                if (list.Tipo.toUpperCase().match($scope.searchByFilter.toUpperCase()) || list.Fecha.toString().match($scope.searchByFilter) || list.RegistrosTotales.toString().match($scope.searchByFilter)) {
                    $scope.instance = 'Metro';
                    $scope.detailByInstance.push(list);
                }
            });
        } else if (document.getElementById("norteOption").checked == true) {
            $scope.norteData.forEach(function (list, i) {
                if (list.Tipo.toUpperCase().match($scope.searchByFilter.toUpperCase()) || list.Fecha.toString().match($scope.searchByFilter) || list.RegistrosTotales.toString().match($scope.searchByFilter)) {
                    $scope.instance = 'Norte';
                    $scope.detailByInstance.push(list);
                }
            });
        } else {
            $scope.searchByFilter = '';
        }
    }
    function sendDateailByInstance() {
        if (document.getElementById("zequenceOption").checked == true) {
            $scope.detailByInstance = $scope.zequenceData;
            $scope.instance = 'Zequence';
        } else if (document.getElementById("interiorOption").checked == true) {
            $scope.detailByInstance = $scope.interiorData;
            $scope.instance = 'Interior';
        } else if (document.getElementById("metroOption").checked == true) {
            $scope.detailByInstance = $scope.metroData;
            $scope.instance = 'Metro';
        } else if (document.getElementById("norteOption").checked == true) {
            $scope.detailByInstance = $scope.norteData;
            $scope.instance = 'Norte';
        }
        $('#detailByInstanceModal').modal('show');
    }
    $scope.viewDetail = function () {
        $scope.searchByFilter = '';
        $scope.detailByInstance = [];
        $scope.instance = '';
        sendDateailByInstance();
    }
    $scope.showSessionModal = function () {
        $scope.detailBySession = $scope.sessionData;
        $scope.searchBySession = "";
        $('#sessionModal').modal('show');
    }
    $scope.showMacModal = function () {
        $('#macModal').modal('show');
    }
    function executeReport(reporterHeaderDTO, reportName, instance) {
        let wifi = 0;
        let ping = 0;
        let speed = 0;
        let dataGraph = [];
        
        $http({
            method: "POST",
            url: urlMwServer + "/rest/ExecuteGenericReport",
            data: angular.toJson(reporterHeaderDTO)
        }).then(function mySuccess(response) {
            if (response.data['ErrorMessage'] === null || response.data['ErrorMessage'] === undefined) {
                if (reportName.match('Conteo de peticiones Ping por Instancia')) {
                    $scope.pingData = response.data.Result;
                    response.data.Result.forEach(function (r, i) {
                        $scope.pingTotal += r.RegistrosTotales; 
                    });
                    createGraph(document.getElementById("chartPing"), response.data.Result);
                }
                if (reportName.match('reset')) {
                    $scope.resetData = response.data.Result;
                    response.data.Result.forEach(function (r, i) {
                        $scope.resetTotal += r.RegistrosTotales;
                    });
                    createGraph(document.getElementById("chartReset"), response.data.Result);
                }
                if (reportName.match('Conteo de peticiones ConsultaWifi por Instancia')) {
                    $scope.wifiData = response.data.Result;
                    response.data.Result.forEach(function (r, i) {
                        $scope.wifiTotal += r.RegistrosTotales;
                    });
                createGraph(document.getElementById("chartWifi"), response.data.Result);
                }
                if (reportName.match('Conteo de peticiones SpeedTest por Instancia')) {
                    $scope.speedData = response.data.Result;
                    response.data.Result.forEach(function (r, i) {
                        $scope.speedTotal += r.RegistrosTotales;
                    });
                    createGraph(document.getElementById("chartSpeed"), response.data.Result);
                }
                if (reportName.match('Conteo de operaciones por tipo')) {
                    $scope.dataOperations = response.data.Result;
                    createGraphOperations(document.getElementById("chartOperations"), response.data.Result);
                }
                if (instance == "I") {
                    response.data.Result.forEach(function (r, i) {
                        if (r.Tipo == "ConsultaWifi") {
                            wifi += r.RegistrosTotales;
                        } else if (r.Tipo == "Ping") {
                            ping += r.RegistrosTotales;
                        } else if (r.Tipo == "SpeedTest") {
                            speed += r.RegistrosTotales;
                        }
                        dataGraph = [
                            {
                                'Tipo': 'ConsultaWifi',
                                'RegistrosTotales': wifi
                            },
                            {
                                'Tipo': 'Ping',
                                'RegistrosTotales': ping
                            },
                            {
                                'Tipo': 'SpeedTest',
                                'RegistrosTotales': speed
                            }
                        ];
                        r.Fecha = r.Fecha.replace('T00:00:00', '');
                    });
                    $scope.interiorTotal = wifi + ping + speed;
                    $scope.interiorData = response.data.Result;
                    cretaeGraphByInstance(document.getElementById("chartInterior"), dataGraph);
                } else if (instance == "M") {
                    response.data.Result.forEach(function (r, i) {
                        if (r.Tipo == "ConsultaWifi") {
                            wifi += r.RegistrosTotales;
                        } else if (r.Tipo == "Ping") {
                            ping += r.RegistrosTotales;
                        } else if (r.Tipo == "SpeedTest") {
                            speed += r.RegistrosTotales;
                        }
                        dataGraph = [
                            {
                                'Tipo': 'ConsultaWifi',
                                'RegistrosTotales': wifi
                            },
                            {
                                'Tipo': 'Ping',
                                'RegistrosTotales': ping
                            },
                            {
                                'Tipo': 'SpeedTest',
                                'RegistrosTotales': speed
                            }
                        ];
                        r.Fecha = r.Fecha.replace('T00:00:00', '');
                    });
                    $scope.metroTotal = wifi + ping + speed;
                    $scope.metroData = response.data.Result;
                    cretaeGraphByInstance(document.getElementById("chartMetro"), dataGraph);
                } else if (instance == "T") {
                    response.data.Result.forEach(function (r, i) {
                        if (r.Tipo == "ConsultaWifi") {
                            wifi += r.RegistrosTotales;
                        } else if (r.Tipo == "Ping") {
                            ping += r.RegistrosTotales;
                        } else if (r.Tipo == "SpeedTest") {
                            speed += r.RegistrosTotales;
                        }
                        dataGraph = [
                            {
                                'Tipo': 'ConsultaWifi',
                                'RegistrosTotales': wifi
                            },
                            {
                                'Tipo': 'Ping',
                                'RegistrosTotales': ping
                            },
                            {
                                'Tipo': 'SpeedTest',
                                'RegistrosTotales': speed
                            }
                        ];
                        r.Fecha = r.Fecha.replace('T00:00:00', '');
                    });
                    $scope.norteTotal = wifi + ping + speed;
                    $scope.norteData = response.data.Result;
                    cretaeGraphByInstance(document.getElementById("chartNorte"), dataGraph);
                } else if (instance == "Z") {
                    response.data.Result.forEach(function (r, i) {
                        if (r.Tipo == "ConsultaWifi") {
                            wifi += r.RegistrosTotales;
                        } else if (r.Tipo == "Ping") {
                            ping += r.RegistrosTotales;
                        } else if (r.Tipo == "SpeedTest") {
                            speed += r.RegistrosTotales;
                        }
                        dataGraph = [
                            {
                                'Tipo': 'ConsultaWifi',
                                'RegistrosTotales': wifi
                            },
                            {
                                'Tipo': 'Ping',
                                'RegistrosTotales': ping
                            },
                            {
                                'Tipo': 'SpeedTest',
                                'RegistrosTotales': speed
                            }
                        ];
                        r.Fecha = r.Fecha.replace('T00:00:00', '');
                    });
                    $scope.zequenceTotal = wifi + ping + speed;
                    $scope.zequenceData = response.data.Result;
                    cretaeGraphByInstance(document.getElementById("chartZequence"), dataGraph);
                }
                if (reportName.match('Conteo de inicios de sesion')) {
                    fechas = [];
                    totales = [];                   
                    response.data.Result.forEach(function (r, i) {
                        r.Fecha = r.Fecha.replace('T00:00:00', '');
                        fechas.push(r.Fecha);
                        totales.push(r.RegistrosTotales);
                    });
                    $scope.detailBySession = response.data.Result;
                    $scope.sessionData = response.data.Result;
                   
                    createGraphLine(document.getElementById("chartSession"), fechas, totales, '');
                }
                if (reportName.match('Conteo de consultas por mac serial')) {    
                     fechas = [];
                    totales = [];
                    $scope.macIData = [];
                    $scope.macMData = [];
                    $scope.macNData = [];
                    $scope.macZData = [];
                    $scope.macByMetro = 0;
                    $scope.macByInterior = 0;
                    $scope.macByNorte = 0;
                    $scope.macByZequence = 0;
                    response.data.Result.forEach(function (list, i) {
                        list.Fecha = list.Fecha.replace('T00:00:00', '');
                        if (list.Instancia.match('I')) {
                            $scope.macIData.push(list);
                            $scope.macByInterior += 1;
                        } else if (list.Instancia.match('M')) {
                            $scope.macMData.push(list);
                            $scope.macByMetro += 1;
                        } else if (list.Instancia.match('T')) {
                            $scope.macNData.push(list);
                            $scope.macByNorte += 1;
                        } else if (list.Instancia.match('Z')) {
                            $scope.macZData.push(list);
                            $scope.macByZequence += 1;
                        }
                    });
                    if (document.getElementById("switchZequence").checked == true) {
                        $scope.macData = $scope.macZData;                        
                        x = $scope.macZData.reduce(function (obj, i) {
                            obj[i.Fecha] = i.Fecha;
                            return obj;
                        }, {});
                        XAtributes = Object.values(x);
                        XAtributes.forEach(function (data, index) {
                            fechas.push(data);
                        });
                       y = $scope.macZData.reduce(function (obj, i) {
                            obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                            return obj;
                        }, {});
                        YAtributes = Object.values(y);
                        YAtributes.forEach(function (data, index) {
                            totales.push(data);
                        });
                    } else if (document.getElementById("switchNorte").checked == true) {
                        $scope.macData = $scope.macNData;
                        x = $scope.macNData.reduce(function (obj, i) {
                            obj[i.Fecha] = i.Fecha;
                            return obj;
                        }, {});
                        XAtributes = Object.values(x);
                        XAtributes.forEach(function (data, index) {
                            fechas.push(data);
                        });
                        y = $scope.macNData.reduce(function (obj, i) {
                            obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                            return obj;
                        }, {});
                        YAtributes = Object.values(y);
                        YAtributes.forEach(function (data, index) {
                            totales.push(data);
                        });
                    } else if (document.getElementById("switchInterior").checked == true) {
                        $scope.macData = $scope.macIData;
                        x = $scope.macIData.reduce(function (obj, i) {
                            obj[i.Fecha] = i.Fecha;
                            return obj;
                        }, {});
                        XAtributes = Object.values(x);
                        XAtributes.forEach(function (data, index) {
                            fechas.push(data);
                        });
                        y = $scope.macIData.reduce(function (obj, i) {
                            obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                            return obj;
                        }, {});
                        YAtributes = Object.values(y);
                        YAtributes.forEach(function (data, index) {
                            totales.push(data);
                        });
                    } else if (document.getElementById("switchMetro").checked == true) {
                        $scope.macData = $scope.macMData;
                        x = $scope.macMData.reduce(function (obj, i) {
                            obj[i.Fecha] = i.Fecha;
                            return obj;
                        }, {});
                        XAtributes = Object.values(x);
                        XAtributes.forEach(function (data, index) {
                            fechas.push(data);
                        });
                        y = $scope.macMData.reduce(function (obj, i) {
                            obj[i.Fecha] = (obj[i.Fecha] || 0) + 1;
                            return obj;
                        }, {});
                        YAtributes = Object.values(y);
                        YAtributes.forEach(function (data, index) {
                            totales.push(data);
                        });
                    }
                    createGraphLine(document.getElementById("chartMac"), fechas.sort(), totales.sort(), '');
                }
            } else {
                alert('Dashboard', response.data['ErrorMessage'], 'error');
            }
        }, function myError() {
                alert('Dashboard', 'Error al solicitar petición', 'error');
        });
    }
    function getLazyReporterByName(reportName) {
        $http({
            method: "GET",
            url: urlMwServer + "/rest/GetLazyReporterByName",
            params: { reportName: reportName}
        }).then(function mySuccess(response) {
            if (response.data['ErrorMessage'] === null || response.data['ErrorMessage'] === undefined) {
                $scope.reporterHeaderDTO = response.data;
                $scope.reporterHeaderDTO.FiltersDTO[0].IsEnabled = true;
                $scope.reporterHeaderDTO.FiltersDTO[0].OperatorDTOs[0].IsEnabled = true;
                $scope.reporterHeaderDTO.FiltersDTO[0].Valor = $scope.initialDate.getFullYear().toString() + '-'
                    + (($scope.initialDate.getMonth() + 1).toString().length == 1 ? '0' + ($scope.initialDate.getMonth() + 1).toString() : ($scope.initialDate.getMonth() + 1)) + '-'
                    + $scope.initialDate.getDate().toString();

                executeReport($scope.reporterHeaderDTO, reportName);               
            } else {
                alert('Dashboard', response.data['ErrorMessage'], 'error');
            }
            
        }, function myError() {
            alert('Dashboard', 'Error al solicitar petición', 'error');
        });
    }
    function getLazyReporterByInstance(reportName, instance) {
        $http({
            method: "GET",
            url: urlMwServer + "/rest/GetLazyReporterByName",
            params: { reportName: reportName }
        }).then(function mySuccess(response) {
            if (response.data['ErrorMessage'] === null || response.data['ErrorMessage'] === undefined) {
                $scope.reporterHeaderDTO = response.data;
                $scope.reporterHeaderDTO.FiltersDTO[0].IsEnabled = true;
                $scope.reporterHeaderDTO.FiltersDTO[0].OperatorDTOs[0].IsEnabled = true;
                $scope.reporterHeaderDTO.FiltersDTO[0].Valor = $scope.initialDate.getFullYear().toString() + '-'
                    + (($scope.initialDate.getMonth() + 1).toString().length == 1 ? '0' + ($scope.initialDate.getMonth() + 1).toString() : ($scope.initialDate.getMonth() + 1)) + '-'
                    + $scope.initialDate.getDate().toString();
                $scope.reporterHeaderDTO.FiltersDTO[1].IsEnabled = true;
                $scope.reporterHeaderDTO.FiltersDTO[1].OperatorDTOs[0].IsEnabled = true;
                $scope.reporterHeaderDTO.FiltersDTO[1].Valor = instance;
               
                executeReport($scope.reporterHeaderDTO, reportName, instance);
            } else {
                alert('Dashboard', response.data['ErrorMessage'], 'error');
            }

        }, function myError() {
            alert('Dashboard', 'Error al solicitar petición', 'error');
        });
    }
    function getPingData() {
        getLazyReporterByName('Conteo de peticiones Ping por Instancia');
    }
    function getWifiData() {
        getLazyReporterByName('Conteo de peticiones ConsultaWifi por Instancia');
    }
    function getSpeedData() {
        getLazyReporterByName('Conteo de peticiones SpeedTest por Instancia');
    }
    function getOperations() {
        getLazyReporterByName('Conteo de operaciones por tipo');
    }
    function getInteriorData() {
        getLazyReporterByInstance('Conteo de peticiones masivas por Instancia', 'I');
    }
    function getMetroData() {
        getLazyReporterByInstance('Conteo de peticiones masivas por Instancia', 'M');
    }
    function getNorteData() {
        getLazyReporterByInstance('Conteo de peticiones masivas por Instancia', 'T');
    }
    function getZequenceData() {
        getLazyReporterByInstance('Conteo de peticiones masivas por Instancia', 'Z');
    }
    function getSession() {
        getLazyReporterByName('Conteo de inicios de sesion');
    }
    function getMac() {
        getLazyReporterByName('Conteo de consultas por mac serial');
    }
    function getInitialDate() {
        var date = new Date();
        date.setDate(date.getDate() - $scope.days);
        $scope.initialDate = date;
        initDashboard();
        $scope.intervalo = $interval(function () {
        }, date);
    }
    $("#rangeDay").ionRangeSlider({
        skin: "square",
        min: 0,
        max: 30,
        onFinish: function (data) {
            $scope.days = data.from_pretty;
            getInitialDate();
        }
    });
    $scope.dashboardRefresh = function () {
        $scope.days = "0";
        $scope.finalDate = new Date();
        $scope.initialDate = new Date();
        let range_day = $("#rangeDay").data("ionRangeSlider");
        range_day.reset();
        initDashboard();
    }
    function initDashboard() {       
        getPingData();
        getWifiData();
        getSpeedData();
        getOperations();
        getInteriorData();
        getMetroData();
        getNorteData();
        getZequenceData();    
        getSession();
        getMac();
        $scope.searchByFilter = '';
    }
});
function alert(title, message, type) {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-left",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": 150,
        "hideDuration": 1000,
        "timeOut": 5000,
        "extendedTimeOut": 1000,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr[type](message, title)
}
function SwetAlertMessage(Message,Title,Type)
{
    swal({
        title: Title,
        text: Message,
        icon: Type,
        html: `<input type="text" id="login" class="swal2-input" placeholder="Username">
        <input type="password" id="password" class="swal2-input" placeholder="Password">`,
        confirmButtonText: 'Sign in',
        buttons: "Cerrar",
        dangerMode: true,
      })
}
function spinnerOn() {
    document.getElementById("overlay").style.display = "flex";
}
function spinnerOff() {
    document.getElementById("overlay").style.display = "none";
}