const createTenantTables = async (tenantDb) => {
  // ==================== SUPER ADMIN TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS super_admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id VARCHAR(50),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      user_type ENUM('Super_admin') NOT NULL DEFAULT 'Super_admin',
      department INT,
      role INT,
      designation INT,
      email VARCHAR(150),
      profile_image VARCHAR(255),
      password VARCHAR(255),
      mobile_number VARCHAR(20),
      whatsapp_number VARCHAR(20),
      emergency_number VARCHAR(20),
      phone_extension VARCHAR(10),
      full_address TEXT,
      province VARCHAR(100),
      country VARCHAR(100),
      city VARCHAR(100),
      postal_code VARCHAR(20),
      facebook_link VARCHAR(255),
      linkedin_link VARCHAR(255),
      x_link VARCHAR(255),
      blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      gender VARCHAR(20),
      joining_date DATE,
      date_of_birth DATE,
      identity_type VARCHAR(50),
      identity_number VARCHAR(100),
      status ENUM('active', 'inactive'),
      refresh_token TEXT,
      otp VARCHAR(6),
      otp_expires_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // ==================== COMPANIES TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_id VARCHAR(255),
      company VARCHAR(255) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      ntn_vat VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      whatsapp_no VARCHAR(20),
      address TEXT,
      zipcode VARCHAR(20),
      website_url VARCHAR(255),
      state_province VARCHAR(255),
      country VARCHAR(255),
      city VARCHAR(255),
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      brief_note TEXT
    )
  `);
  
  // ==================== company_admin_access TABLE ====================
  await tenantDb.execute(`
      CREATE TABLE company_admin_access (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          super_admin_id INT NOT NULL,
          user_type ENUM('Super_admin') DEFAULT 'Super_admin',
          status ENUM('active','inactive') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          UNIQUE KEY uniq_company_admin (company_id, super_admin_id)
      );
  `);

  // ==================== DEPARTMENTS TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      department VARCHAR(150) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // ==================== DESIGNATIONS TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS designations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      designation_name VARCHAR(150) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // ==================== ROLES TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      role_name VARCHAR(150) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // ==================== brand_manufacturer TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS brand_manufacturer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      brand_manufacturer VARCHAR(150) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);


  // ==================== EMPLOYEE INFO ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS employee_info (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      emp_id INT NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      email VARCHAR(150),
      profile_image VARCHAR(255),
      password VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      user_type ENUM('ADMIN','HR','MANAGER','EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
      blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
      gender ENUM('male','female','other'),
      joining_date DATE,
      date_of_birth DATE,
      identity_type ENUM('CNIC','NICOP','SSN') DEFAULT 'CNIC',
      identity_number VARCHAR(50),
      mobile_number VARCHAR(20),
      whatsapp_number VARCHAR(20),
      emergency_number VARCHAR(20),
      phone_extension VARCHAR(20),
      full_address TEXT,
      province VARCHAR(100),
      country VARCHAR(100),
      city VARCHAR(100),
      department INT,
      role INT,
      designation INT,
      postal_code VARCHAR(20),
      facebook_link VARCHAR(255),
      linkedin_link VARCHAR(255),
      x_link VARCHAR(255),
      otp VARCHAR(6),
      otp_expires_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    )
  `);

  // ================== EMPLOYEEE EDUCATION TABLE ===============
  await tenantDb.execute(` 
    CREATE TABLE employee_education (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      user_id INT NOT NULL,

      level ENUM(
          'Matric','O-level','A-level','college','Intermediate',
          'Bachelor','Master','Diploma','PhD','MPhil','Others'
      ) NOT NULL,

      institute_name VARCHAR(255) NOT NULL,
      board VARCHAR(255),
      completed_year YEAR NOT NULL,
      city VARCHAR(100),
      certificate_file VARCHAR(255),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      UNIQUE KEY unique_emp_level (company_id, user_id, level),
      INDEX (company_id),
      INDEX (user_id)
  );
  `)

  // ===================== SUPER ADMIN EDUCATION TABLE ===================
  await tenantDb.execute(`
    CREATE TABLE super_admin_education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    super_admin_id INT NOT NULL,

    level ENUM(
        'Matric','O-level','A-level','college','Intermediate',
        'Bachelor','Master','Diploma','PhD','MPhil','Others'
    ) NOT NULL,

    institute_name VARCHAR(255) NOT NULL,
    board VARCHAR(255),
    completed_year YEAR NOT NULL,
    city VARCHAR(100),
    certificate_file VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_admin_level (company_id, super_admin_id, level),
    INDEX (company_id),
    INDEX (super_admin_id)
);
    
  `)

  // ==================  SUPER ADMIN QUALIFICATION TABLE ===============
  await tenantDb.execute(`
    CREATE TABLE super_admin_qualification (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        super_admin_id INT NOT NULL,

        certification_no VARCHAR(100) NOT NULL,
        institute_name VARCHAR(255) NOT NULL,
        completed_date DATE NOT NULL,
        city VARCHAR(100),
        certificate_file VARCHAR(255),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        INDEX (company_id),
        INDEX (super_admin_id),

        UNIQUE KEY unique_cert_super_admin (company_id, super_admin_id, certification_no)
    );
  `)


  // ==================== USER QUALIFICATION TABLE ========================
  await tenantDb.execute(`
  CREATE TABLE employee_qualification (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      user_id INT NOT NULL,

      certification_no VARCHAR(100) NOT NULL,
      institute_name VARCHAR(255) NOT NULL,
      completed_date DATE NOT NULL,
      city VARCHAR(100),
      certificate_file VARCHAR(255),

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      INDEX (company_id),
      INDEX (user_id),

      UNIQUE KEY unique_cert_employee (company_id, user_id, certification_no)
  );
  `)

    // ======================= USER EXPERIANCE TABLE =====================================
  await tenantDb.execute(` 
        CREATE TABLE super_admin_experience (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          super_admin_id INT NOT NULL,

          company_name VARCHAR(255) NOT NULL,
          industry VARCHAR(150),
          job_title VARCHAR(150) NOT NULL,
          employment_type ENUM('Full-time','Part-time','Contract','Internship','Freelance') NOT NULL,

          start_date DATE NOT NULL,
          end_date DATE NULL,
          currently_working BOOLEAN DEFAULT FALSE,

          responsibilities TEXT,
          reason_for_leaving TEXT,
          document_file VARCHAR(255),

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
  `)


  // ======================= USER EXPERIANCE TABLE =====================================
  await tenantDb.execute(` 
        CREATE TABLE employee_experience (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          user_id INT NOT NULL,

          company_name VARCHAR(255) NOT NULL,
          industry VARCHAR(150),
          job_title VARCHAR(150) NOT NULL,
          employment_type ENUM('Full-time','Part-time','Contract','Internship','Freelance') NOT NULL,

          start_date DATE NOT NULL,
          end_date DATE NULL,
          currently_working BOOLEAN DEFAULT FALSE,

          responsibilities TEXT,
          reason_for_leaving TEXT,
          document_file VARCHAR(255),

          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
  `)

  // ==================== HARDWARE TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS hardware (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      record_date DATE,
      asset_type VARCHAR(100),
      brand_manufacturer INT,
      model VARCHAR(150),
      service_tag VARCHAR(150),
      purchase_date DATE,
      warranty_expire DATE,
      purchase_cost DECIMAL(12,2),
      vendor_supplier VARCHAR(255),
      status VARCHAR(255),
      assigned_to_depart INT,
      purchase_date_2 DATE,
      location VARCHAR(255),
      assigned_to_emp INT,
      custodian_owner VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // ==================== SOFTWARE TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS software (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      software_name VARCHAR(255) NOT NULL,
      package_name VARCHAR(255),
      vendor_name VARCHAR(255),
      no_of_license_purchased INT,
      license_type ENUM('Perpetual','Subscription','Open Source'),
      renewal_date_1 DATE,
      license_expiry DATE,
      deployment_method ENUM('Standalone','Server','Cloud'),
      license_cost_per_user DECIMAL(12,2),
      renewal_date_2 DATE,
      po_number VARCHAR(255),
      record_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // ==================== TICKETS / TICKET REPLIES ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS ticket_replies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ticket_id INT NOT NULL,
      replied_by INT,
      sender_role ENUM('user','admin','subadmin') DEFAULT 'user',
      message TEXT NOT NULL,
      attachment VARCHAR(255),
      is_internal TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  /* ==================== MODULES Table ==================== */
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50),
      slug VARCHAR(50) UNIQUE
    )
  `);

  /* ==================== INSERT MODULES ==================== */
  const [modCount] = await tenantDb.execute(
    "SELECT COUNT(*) AS count FROM modules"
  );

  if (modCount[0].count === 0) {
    const modules = [
      ["overview", "overview"],
      ["software", "software"],
      ["hardware", "hardware"],
      ["tickets", "tickets"],
      ["vendor", "vendor"],
      ["purchase_order", "purchase_order"],
      ["people", "people"],
      ["Brand", "Brand"],
      ["roles", "roles"],
      ["department", "department"],
      ["designation", "designation"]
    ];

    const placeholders = modules.map(() => "(?, ?)").join(",");
    const values = modules.flat();

    await tenantDb.execute(
      `INSERT INTO modules (name, slug) VALUES ${placeholders}`,
      values
    );

  }

  /* ==================== PERMISSIONS Table ==================== */
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT,
      action VARCHAR(50),
      slug VARCHAR(100) UNIQUE,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )
  `);

  /* ==================== INSERT PERMISSIONS (DYNAMIC) ==================== */
  const [permCount] = await tenantDb.execute(
    "SELECT COUNT(*) AS count FROM permissions"
  );

  if (permCount[0].count === 0) {

    const [modules] = await tenantDb.execute(
      "SELECT id, slug FROM modules"
    );

    const moduleMap = {};
    modules.forEach(m => (moduleMap[m.slug] = m.id));

    const permissions = [
      ["overview", "view", "overview_view"],
      ["overview", "company_update", "overview_company_update"],

      ["software", "view", "software_view"],
      ["software", "create", "software_create"],
      ["software", "update", "software_update"],
      ["software", "delete", "software_delete"],

      ["hardware", "view", "hardware_view"],
      ["hardware", "create", "hardware_create"],
      ["hardware", "update", "hardware_update"],
      ["hardware", "delete", "hardware_delete"],

      ["tickets", "view", "tickets_view"],
      ["tickets", "create", "tickets_create"],
      ["tickets", "update", "tickets_update"],
      ["tickets", "delete", "tickets_delete"],
      ["tickets", "assign", "tickets_assign"],
      ["tickets", "close", "tickets_close"],

      ["vendor", "view", "vendor_view"],
      ["vendor", "create", "vendor_create"],
      ["vendor", "update", "vendor_update"],
      ["vendor", "delete", "vendor_delete"],
      ["vendor", "approved", "vendor_approved"],

      ["purchase_order", "view", "purchase_order_view"],
      ["purchase_order", "create", "purchase_order_create"],
      ["purchase_order", "update", "purchase_order_update"],
      ["purchase_order", "delete", "purchase_order_delete"],

      ["people", "view", "people_view"],
      ["people", "create", "people_create"],
      ["people", "update", "people_update"],
      ["people", "delete", "people_delete"],

      ["Brand", "view", "Brand_view"],
      ["Brand", "create", "Brand_create"],

      ["roles", "view", "roles_view"],
      ["roles", "create", "roles_create"],

      ["department", "view", "department_view"],
      ["department", "create", "department_create"],

      ["designation", "view", "designation_view"],
      ["designation", "create", "designation_create"]
    ];

    const values = [];
    const placeholders = [];

    permissions.forEach(([moduleSlug, action, slug]) => {
      const moduleId = moduleMap[moduleSlug];
      if (!moduleId) return;

      placeholders.push("(?, ?, ?)");
      values.push(moduleId, action, slug);
    });

    await tenantDb.execute(
      `INSERT INTO permissions (module_id, action, slug)
       VALUES ${placeholders.join(",")}`,
      values
    );

  }


  // ==================== module_fields Table ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS module_fields (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT,
      field_name VARCHAR(100),
      field_label VARCHAR(100),
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    )
  `);


  // ==================== EMPLOYEE PERMISSIONS Table ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS employee_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      employee_id INT,
      permission_id INT,
      assigned TINYINT(1) DEFAULT 0
    )
  `);

  // ============= employee_field_permissions Table ================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS employee_field_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT,
      employee_id INT,
      module_field_id INT,
      can_view TINYINT(1) DEFAULT 0,
      can_edit TINYINT(1) DEFAULT 0
      
    )
  `);

  // ==================== THEME SETTINGS Table ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS theme_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      theme_mode VARCHAR(20) DEFAULT 'dark',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

};

module.exports = { createTenantTables };


