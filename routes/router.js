const router = require("express").Router();
const { verifyToken } = require('../middlewares/authMiddleware')
const { SignupFunction,RefreshToken, SignInUser, signupWithCompany} = require("../controllers/SignUp/index");
const { GetUser,UpdateCompany, GetCompanyByAdmin } = require("../controllers/company/index")
const { CreateHardware,GetAllHardware,UpdateHardware, GetHardwareById, DeleteHardware, generateUniqueBarcode } = require("../controllers/assets/hardware/index")
const { CreateSoftware, GetAllSoftware, GetSoftwareById, UpdateSoftware, DeleteSoftware } = require("../controllers/assets/Software/index")
const upload = require("../controllers/filemulters/projectMulter"); 
const { GetAllBrandsManufacturer, CreateBrand } = require("../controllers/Brand");
const { GetAllDepartments, CreateDepartment } = require("../controllers/Departments");
const { createTicket, GetAllTickets } = require("../controllers/tickets");
const { getAdminEmployeesPermissions, saveEmployeePermissions } = require("../controllers/permissions/index");
const {resendOtp,verifyOtp, forgotPassSentOtp, updatePassword,} = require("../controllers/Otp/index");
const { CreateRoles, GetAllRoles } = require("../controllers/roles");
const { CreateDesignation, GetAllDesignations } = require("../controllers/designations");
const { SaveTheme, GetTheme } = require("../controllers/themes");
const { GenratedEmpId, CreatePeople, GetEmpByIdSearchWithPagination, GetAllEmployeesBySimpleList, UpdatePeople, DeleteEmployees, UpdateSuperAdmin, uploadUserImage, GetSuperAdminById, uploadSuperAdminImage, GetEmployeeById, CreateSuperAdmin, GenratedSuperAdminEmpId } = require("../controllers/People");
const { syncModules } = require("../controllers/Modules/DataSeeder");
const {checkPermission} = require("../middlewares/PermissionModule");
const tenantDbMiddleware = require("../middlewares/tenantDbMiddleware");
const { saveSuperAdminEducation, getSuperAdminEducation, getSuperAdminEducationById, updateSuperAdminEducation, saveEmployeeEducation, getEmployeeEducation, getEmployeeEducationById, updateEmployeeEducation } = require("../controllers/education");
const setUploadConfig = require("../controllers/filemulters/uploadConfig");
const { saveSuperAdminQualification, getSuperAdminQualifications, getSuperAdminQualificationById, updateSuperAdminQualification, saveEmployeeQualification, getEmployeeQualification, getEmployeeQualificationById, updateEmployeeQualification } = require("../controllers/qualification");
const{ saveSuperAdminExperience, getSuperAdminExperience, getSuperAdminExperienceById, updateSuperAdminExperience, saveEmployeeExperience, getEmployeeExperience, getEmployeeExperienceById, updateEmployeeExperience } = require("../controllers/experiance/index")



// ADMIN/USER ROUTES =========================
router.post('/api/signupWithCompany/User',
    setUploadConfig("company-logos",  ["image/jpeg", "image/png"]),
    upload.single('logo'),
    signupWithCompany);


router.post('/api/SignIn/User',SignInUser)


// COMPANY ROUTES ============================
router.get('/api/company/GetById', 
    verifyToken,
    tenantDbMiddleware,
    checkPermission("overview_view"),
    GetCompanyByAdmin);

router.get('/api/user/user',
    verifyToken,
    tenantDbMiddleware,
    GetUser);

router.post('/api/company/UpdateCompany', 
    verifyToken,
    tenantDbMiddleware,
    checkPermission("overview_company_update"), 
    UpdateCompany);

// REFRESH ROUTES ===================================
router.post('/api/token/refreshToken',RefreshToken)


// BRAND ROUTES =======================================
router.get('/api/GetAllBrandsManufacturer',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("Brand_view"),
    GetAllBrandsManufacturer)


router.post('/api/hardware/CreateBrand',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("Brand_create"),
    CreateBrand)

// DEPARTMENTS ROUTES ==================================
router.get('/api/get/GetAllDepartments',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("department_view"),
    GetAllDepartments)


router.post('/api/hardware/CreateDepartment',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("department_create"),
    CreateDepartment)

// ROLES ROUTES ========================================
router.post('/api/createRole/ByAdmin',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("roles_create"),
    CreateRoles)

router.get('/api/GetAllRole/ByAdmin',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("roles_view"),
    GetAllRoles)


// DESIGNATIONS ROUTES ==================================
router.post('/api/createDesignation/ByAdmin',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("designation_create"),
    CreateDesignation)

router.get('/api/GetAllDesignation/ByAdmin',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("designation_view"),
    GetAllDesignations)

// HARDWARE ROUTES =====================================
router.get(
    '/api/assests/barcode/unique',
    verifyToken,
    tenantDbMiddleware,
    generateUniqueBarcode
);

router.post('/api/hardware/CreateHardware',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("hardware_create"),
    CreateHardware)

router.get('/api/hardware/GetAllHardware',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("hardware_view"),
    GetAllHardware)

router.put('/api/hardware/UpdateHardware/:id',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("hardware_update"),
    UpdateHardware)

router.get("/api/get/all/hardware/:id", 
    verifyToken,
    tenantDbMiddleware,
    GetHardwareById);

router.post('/api/Hardware/DeleteHardware',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("hardware_delete"),
    DeleteHardware);


// SOFTWARE ROUTES ========================================
router.post('/api/software/CreateSoftware',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("software_create"),
    CreateSoftware)

router.get('/api/software/getAllsoftwareByPage',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("software_view"),
    GetAllSoftware)

router.get("/api/software/all/getsoftware/:id", 
    verifyToken,
    tenantDbMiddleware,
    GetSoftwareById);

router.put('/api/software/UpdateSoftware/:id',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("software_update"),
    UpdateSoftware)

router.post('/api/Software/DeleteSoftware', 
    verifyToken,
    tenantDbMiddleware,
    checkPermission("software_delete"),
    DeleteSoftware);


// PARMISSIONS ROUTES FOR MAIN Super Admin =========================
router.get('/api/permissions_view/byAdmin',
    verifyToken,
    tenantDbMiddleware,
    getAdminEmployeesPermissions)

router.post( "/api/permissions/save/byAdmin",
    verifyToken,
    tenantDbMiddleware,
    saveEmployeePermissions);


// THEME ROUTES ==============================================
router.post('/api/theme/saveThemeSetting',
    verifyToken,
    tenantDbMiddleware,
    SaveTheme)

router.get('/api/theme/getThemeSetting',
    verifyToken,
    tenantDbMiddleware,
    GetTheme)

// EMPLOYEE CRETAE ROUTES =====================================
router.get("/api/emp-next-id",
    verifyToken,
    tenantDbMiddleware,
    GenratedEmpId);

router.get("/api/super-admin-next-id",
    verifyToken,
    tenantDbMiddleware,
    GenratedSuperAdminEmpId
);

router.post("/api/emp/create-emp",
    verifyToken, 
    tenantDbMiddleware,
    checkPermission("people_create"),
    CreatePeople);


router.post("/api/create/create-super-admin",
    verifyToken, 
    tenantDbMiddleware,
    CreateSuperAdmin
);


router.post('/api/profile/Image',
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("user-profile-images",  ["image/jpeg", "image/png","image/jpg"]),
    upload.single('image'),
    uploadUserImage)

router.post('/api/super-admin/profile/Image',
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("super-admin-profile-images",  ["image/jpeg", "image/png","image/jpg"]),
    upload.single('image'),
    uploadSuperAdminImage)

router.put("/api/updateEmp/:id", 
    verifyToken,
    tenantDbMiddleware,
    UpdatePeople);

router.put("/api/UpdateSuperAdmin/:id", 
    verifyToken,
    tenantDbMiddleware,
    UpdateSuperAdmin);

router.post('/api/DeleteEmp', 
    verifyToken,
    tenantDbMiddleware,
    checkPermission("people_delete"),
    DeleteEmployees);

router.get('/api/GetEmpByIdSearchWithPagination',
    verifyToken,
    tenantDbMiddleware,
    checkPermission("people_view"),
    GetEmpByIdSearchWithPagination)

router.get("/api/getEmpolyee/:id", 
    verifyToken,
    tenantDbMiddleware,
    GetEmployeeById);


router.get("/api/GetSuperAdminById/:id", 
    verifyToken,
    tenantDbMiddleware,
    GetSuperAdminById);

router.get("/api/GetAllEmployeesBySimpleList",
    verifyToken,
    tenantDbMiddleware,
    GetAllEmployeesBySimpleList);



// EDUCATIONS CREATE ROUTES =======================
router.post("/api/super-admin/addEducation",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("edu_certificates", ["application/pdf"]),
    upload.single('file'),
    saveSuperAdminEducation
);


router.get("/api/super-admin/getEducation",
    verifyToken,
    tenantDbMiddleware,
    getSuperAdminEducation
);

router.get("/api/super-admin/getEducation/:id",
    verifyToken,
    tenantDbMiddleware,
    getSuperAdminEducationById
);

router.put("/api/super-admin/Update/education/:id",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("edu_certificates", ["application/pdf"]),
    upload.single('file'),
    updateSuperAdminEducation
);


// ===============================

router.post("/api/employee/addEducation",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("edu_certificates", ["application/pdf"]),
    upload.single('file'),
    saveEmployeeEducation
);

router.get("/api/employee/geteducation/:id",
    verifyToken,
    tenantDbMiddleware,
    getEmployeeEducation
);

router.get("/api/employee/geteducationbyId/:id",
    verifyToken,
    tenantDbMiddleware,
    getEmployeeEducationById
);

router.put("/api/employee/update/education/:id",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("edu_certificates", ["application/pdf"]),
    upload.single("file"),
    updateEmployeeEducation
);




// QUALIFICATION CREATE ROUTES =======================
router.post("/api/super-admin/addQulification",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("qua_certificates", ["application/pdf"]),
    upload.single('file'),
    saveSuperAdminQualification
);

router.get("/api/super-admin/getQua",
    verifyToken,
    tenantDbMiddleware,
    getSuperAdminQualifications
);

router.get("/api/super-admin/getQua/:id",
    verifyToken,
    tenantDbMiddleware,
    getSuperAdminQualificationById
);

router.put("/api/super-admin/Update/qualification/:id",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("qua_certificates", ["application/pdf"]),
    upload.single('file'),
    updateSuperAdminQualification
);

// =================================
router.post("/api/employee/addQua",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("qua_certificates", ["application/pdf"]),
    upload.single('file'),
    saveEmployeeQualification
);

router.get("/api/employee/getqua/:id",
    verifyToken,
    tenantDbMiddleware,
    getEmployeeQualification
);

router.get("/api/employee/getQuaById/:id",
    verifyToken,
    tenantDbMiddleware,
    getEmployeeQualificationById
);

router.put("/api/employee/update/qualification/:id",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("qua_certificates", ["application/pdf"]),
    upload.single("file"),
    updateEmployeeQualification
);

// EXPERIANCE CREATE ROUTES =======================
router.post("/api/super-admin/addExperiance",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("experience_docs", ["application/pdf"]),
    upload.single('file'),
    saveSuperAdminExperience
);

router.get("/api/super-admin/getExper",
    verifyToken,
    tenantDbMiddleware,
    getSuperAdminExperience
);

router.get("/api/super-admin/getExper/:id",
    verifyToken,
    tenantDbMiddleware,
    getSuperAdminExperienceById
);

router.put("/api/super-admin/Update/Experiance/:id",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("qua_certificates", ["application/pdf"]),
    upload.single('file'),
    updateSuperAdminExperience
);
// ==========================================
router.post("/api/employee/addExper",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("experience_documents", ["application/pdf"]),
    upload.single('file'),
    saveEmployeeExperience
);

router.get("/api/employee/getExper/:id",
    verifyToken,
    tenantDbMiddleware,
    getEmployeeExperience
);

router.get("/api/employee/getExperById/:id",
    verifyToken,
    tenantDbMiddleware,
    getEmployeeExperienceById
);

router.put("/api/employee/update/experiance/:id",
    verifyToken,
    tenantDbMiddleware,
    setUploadConfig("experience_documents", ["application/pdf"]),
    upload.single("file"),
    updateEmployeeExperience
);


// PERMISSION MODULES SET ROUTES FOR DEVELOPER ===================================
router.post("/api/system/sync-modules",syncModules);


// ADMIN/USER OTP ROUTES ============================
router.post('/api/resendOtp/User', tenantDbMiddleware,resendOtp);
router.post('/api/verifyOtp/User', tenantDbMiddleware,verifyOtp);


// ADMIN/USER FORGOT PASSWORDS ROUTES =======================
router.post("/api/password/forgotPassword",tenantDbMiddleware, forgotPassSentOtp)
router.post("/api/password/updatePassword",tenantDbMiddleware, updatePassword)





// router.post('/api/Tickets/createTicket', verifyToken, createTicket);
// router.get('/api/Tickets/GetAllTickets', verifyToken, GetAllTickets);




module.exports = router;