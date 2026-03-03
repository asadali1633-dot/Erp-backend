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
      user_type ENUM('ADMIN','HR','MANAGER','EMPLOYEE','IT ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
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



  // ==================== asset_categories TABLE ====================
  await tenantDb.execute(`
      CREATE TABLE IF NOT EXISTS asset_categories (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          fields_definition JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );  
  `)
  const [catCount] = await tenantDb.execute(
    "SELECT COUNT(*) AS count FROM asset_categories"
  );
  if (catCount[0].count === 0) {

    // ==================== LAPTOP CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Laptop', 'Company laptops and notebooks with complete details', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Laptop Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "asset_tag",
          "label": "Assets Tag/ID Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "brand",
          "label": "Brand / Manufacturer",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "model",
          "label": "Model Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "serial_no",
          "label": "Serial Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "acquisition_date",
          "label": "Date of Acquisition",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "request_ticket",
          "label": "Request Ticket/Reference Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "location_city",
          "label": "Location/City",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cpu",
          "label": "CPU | Processor",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
            "name": "generation",
            "label": "Generation",
            "type": "text",
            "required": true,
            "section": "main"
        },
        {
          "name": "ram",
          "label": "RAM | Memory",
          "type": "text",
          "required": true,
          "section": "main"
        },
       {
            "name": "primary_storage",
            "label": "Primary Storage (HDD | SSD)",
            "type": "text",
            "required": true,
            "section": "main"
        },
        {
            "name": "secondary_storage",
            "label": "Secondary Storage (HDD | SSD)",
            "type": "text",
            "required": true,
            "section": "main"
        },
        {
          "name": "os",
          "label": "Operating System",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "os_license_key",
          "label": "OS License Key",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "mac_address",
          "label": "Network (MAC Addresses, Wi-Fi, Ethernet)",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "graphics_card",
          "label": "Graphics Card",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "screen_size",
          "label": "Screen Size",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "peripherals",
          "label": "Peripherals Included",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "cost_center",
          "label": "Cost Center/Department",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "business_justification",
          "label": "Business Justification/Purpose",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "vendor",
          "label": "Vendor/Supplier Name",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_start",
          "label": "Warranty Start Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_end",
          "label": "Warranty End Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "expected_lifespan",
          "label": "Expected Lifespan",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "assigned_to_name",
          "label": "Assigned To (User''s Name)",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "employee_id",
          "label": "User''s Employee ID/Username",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "assigned_date",
          "label": "Assigned Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "department",
          "label": "Department/Cost Center",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "physical_location",
          "label": "Physical Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "status",
          "label": "Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Available", "Assigned", "Under Repair", "Retired", "Lost/Stolen"]
        },
        {
          "name": "user_software_licenses",
          "label": "Primary User Software Licenses",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "security_software",
          "label": "Security Software Installed",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "ownership_type",
          "label": "Owned vs. Leased",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Owned", "Leased", "Rented", "Contract"]
        },
        {
          "name": "lease_expiry",
          "label": "Lease Expiry Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "next_maintenance",
          "label": "Next Scheduled Maintenance Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_date",
          "label": "Decommission/Disposal Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Sold", "Recycled", "Donated", "E-Waste", "Return to Lessor"]
        },
        {
          "name": "depreciation_value",
          "label": "Depreciation Value",
          "type": "number",
          "required": false,
          "section": "main"
        },
        {
          "name": "parent_asset",
          "label": "Parent Asset",
          "type": "text",
          "required": false,
          "section": "main"
        }
      ]
    }')
  `);
  
     // ==================== DESKTOP CATEGORY (FIXED) ====================
     await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Desktop', 'Company Desktop and notebooks with complete details', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Desktop Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "asset_tag",
          "label": "Assets Tag/ID Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "brand",
          "label": "Brand / Manufacturer",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "model",
          "label": "Model Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "serial_no",
          "label": "Serial Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "acquisition_date",
          "label": "Date of Acquisition",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "request_ticket",
          "label": "Request Ticket/Reference Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "location_city",
          "label": "Location/City",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cpu",
          "label": "CPU | Processor",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
            "name": "generation",
            "label": "Generation",
            "type": "text",
            "required": true,
            "section": "main"
        },
        {
          "name": "ram",
          "label": "RAM | Memory",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
            "name": "primary_storage",
            "label": "Primary Storage (HDD | SSD)",
            "type": "text",
            "required": true,
            "section": "main"
        },
        {
            "name": "secondary_storage",
            "label": "Secondary Storage (HDD | SSD)",
            "type": "text",
            "required": true,
            "section": "main"
        },
        {
          "name": "os",
          "label": "Operating System",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "os_license_key",
          "label": "OS License Key",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "mac_address",
          "label": "Network (MAC Addresses, Wi-Fi, Ethernet)",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "graphics_card",
          "label": "Graphics Card",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "screen_size",
          "label": "Screen Size",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "peripherals",
          "label": "Peripherals Included",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "cost_center",
          "label": "Cost Center/Department",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "business_justification",
          "label": "Business Justification/Purpose",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "vendor",
          "label": "Vendor/Supplier Name",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_start",
          "label": "Warranty Start Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_end",
          "label": "Warranty End Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "expected_lifespan",
          "label": "Expected Lifespan",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "assigned_to_name",
          "label": "Assigned To (User''s Name)",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "employee_id",
          "label": "User''s Employee ID/Username",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "assigned_date",
          "label": "Assigned Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "department",
          "label": "Department/Cost Center",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "physical_location",
          "label": "Physical Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "status",
          "label": "Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Available", "Assigned", "Under Repair", "Retired", "Lost/Stolen"]
        },
        {
          "name": "user_software_licenses",
          "label": "Primary User Software Licenses",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "security_software",
          "label": "Security Software Installed",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "ownership_type",
          "label": "Owned vs. Leased",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Owned", "Leased", "Rented", "Contract"]
        },
        {
          "name": "lease_expiry",
          "label": "Lease Expiry Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "next_maintenance",
          "label": "Next Scheduled Maintenance Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_date",
          "label": "Decommission/Disposal Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Sold", "Recycled", "Donated", "E-Waste", "Return to Lessor"]
        },
        {
          "name": "depreciation_value",
          "label": "Depreciation Value",
          "type": "number",
          "required": false,
          "section": "main"
        },
        {
          "name": "parent_asset",
          "label": "Parent Asset",
          "type": "text",
          "required": false,
          "section": "main"
        }
      ]
    }')
  `);

    // ==================== PHONE CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Phone', 'Company mobile phones with complete details', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Phone Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "device_type",
          "label": "Device Type",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "manufacturer",
          "label": "Manufacturer",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "model_name",
          "label": "Model Name",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "model_number",
          "label": "Model Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "color",
          "label": "Color",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "imei_slot_1",
          "label": "IMEI Number (Slot 1)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "imei_slot_2",
          "label": "IMEI Number (Slot 2)",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "meid_esn",
          "label": "MEID/ESN",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "serial_number",
          "label": "Serial Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "sim_iccid",
          "label": "SIM Card ICCID",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "sim_type",
          "label": "Physical SIM / eSIM",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "secondary_sim_iccid",
          "label": "Secondary SIM ICCID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "wifi_mac",
          "label": "MAC Address (Wi-Fi)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "bluetooth_mac",
          "label": "Bluetooth MAC Address",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "assigned_to_name",
          "label": "Assigned To",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "operating_system",
          "label": "Operating System",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "os_version",
          "label": "OS Version",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "storage_capacity",
          "label": "Storage Capacity",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "ram",
          "label": "RAM",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "processor",
          "label": "Processor/Chipset",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "screen_size",
          "label": "Screen Size",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "battery_capacity",
          "label": "Battery Capacity",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "is_5g_capable",
          "label": "5G Capable",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "fingerprint_sensor",
          "label": "Fingerprint Sensor",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "face_unlock",
          "label": "Face Unlock",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "water_resistance",
          "label": "Water/Dust Resistance Rating",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "nfc_support",
          "label": "NFC Support",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "wireless_charging",
          "label": "Wireless Charging",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "camera_specs",
          "label": "Camera Specifications",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "network_lock_status",
          "label": "Network Lock Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "primary_carrier",
          "label": "Primary Carrier/Service Provider",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "mobile_number",
          "label": "Mobile Number (MSISDN)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "number_ported",
          "label": "Mobile Number Ported",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "plan_type",
          "label": "Plan Type",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "plan_name",
          "label": "Plan Name / Rate Plan",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "data_allowance",
          "label": "Data Allowance",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "roaming_enabled",
          "label": "International Roaming Enabled",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "roaming_restrictions",
          "label": "Roaming Restrictions",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "volte_vowifi",
          "label": "VoLTE/VoWiFi Capable",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "apn_config",
          "label": "APN Configuration",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "carrier_account",
          "label": "Carrier Account Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "billing_account",
          "label": "Billing Account ID / Cost Centre",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "contract_start_date",
          "label": "Contract Start Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "contract_end_date",
          "label": "Contract End Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "contract_renewal_date",
          "label": "Contract Renewal Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "early_termination_fee",
          "label": "Early Termination Fee",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "payment_plan",
          "label": "Device Payment Plan",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "vendor",
          "label": "Vendor/Reseller",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "purchase_date",
          "label": "Purchase Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost (Device only)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "subsidized_cost",
          "label": "Subsidized Cost",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "total_cost_with_plan",
          "label": "Total Cost with Plan",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "cost_center",
          "label": "Cost Center / Department Budget",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "expenditure_type",
          "label": "Capital/Operational Expenditure",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "warranty_start_date",
          "label": "Warranty Start Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "warranty_end_date",
          "label": "Warranty End Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "warranty_type",
          "label": "Warranty Type",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "insurance_provider",
          "label": "Insurance Provider",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "insurance_policy_number",
          "label": "Insurance Policy Number",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "insurance_expiry_date",
          "label": "Insurance Expiry Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "insurance_coverage",
          "label": "Insurance Coverage Details",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "deductible_amount",
          "label": "Deductible Amount",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "mdm_enrolled",
          "label": "Mobile Device Management (MDM) Enrolled",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "mdm_profile",
          "label": "MDM Profile Name / Server",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "last_mdm_checkin",
          "label": "Last MDM Check-in",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "compliance_status",
          "label": "Compliance Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "encryption_status",
          "label": "Encryption Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "screen_lock_method",
          "label": "Screen Lock Method",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "min_pin_length",
          "label": "Minimum PIN Length Policy",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "passcode_compliance",
          "label": "Passcode Compliance",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "security_patch_level",
          "label": "Security Patch Level",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "installed_apps",
          "label": "Containers/Apps Installed",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "blocked_apps",
          "label": "Blacklisted/Blocked Apps",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "jailbreak_status",
          "label": "Jailbreak/Root Detection Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "remote_wipe_capable",
          "label": "Remote Wipe Capable",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "last_remote_wipe_test",
          "label": "Last Remote Wipe Test Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "certificate_expiry",
          "label": "Certificate Expiry",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "ownership_model",
          "label": "BYOD / Corporate-Owned",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "charger_included",
          "label": "Charger Included",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "charger_asset_id",
          "label": "Charger Asset ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "cable_included",
          "label": "Cable Included",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "case_included",
          "label": "Case Included",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "case_asset_id",
          "label": "Case Asset ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "screen_protector",
          "label": "Screen Protector Installed",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "headphones",
          "label": "Headphones/Headset",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "additional_accessories",
          "label": "Additional Accessories",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "accessory_kit_complete",
          "label": "Accessory Kit Complete",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "spare_battery",
          "label": "Spare Battery",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "condition_at_assignment",
          "label": "Device Condition at Assignment",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "current_condition",
          "label": "Current Condition",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "damage_notes",
          "label": "Damage/Cosmetic Notes",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "battery_health",
          "label": "Battery Health",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "repair_history",
          "label": "Repair History",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "last_repair_date",
          "label": "Last Repair Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "total_repair_cost",
          "label": "Total Repair Cost (Lifetime)",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "loaner_device_id",
          "label": "Loaner Device ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "replacement_device_id",
          "label": "Replacement Device ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "maintenance_schedule",
          "label": "Maintenance Schedule",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "expected_replacement_date",
          "label": "Expected Replacement Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "retirement_reason",
          "label": "Retirement Reason",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "retirement_date",
          "label": "Retirement Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "data_wipe_method",
          "label": "Data Wipe Method",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "wipe_certification",
          "label": "Data Wipe Certification",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "disposal_certificate",
          "label": "Disposal Certificate / Proof of Recycling",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "trade_in_value",
          "label": "Trade-in Value Received",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "sim_disposal",
          "label": "SIM Card Disposal",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "final_status",
          "label": "Final Status",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "record_created_by",
          "label": "Record Created By",
          "type": "text",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "record_created_date",
          "label": "Record Created Date",
          "type": "date",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "last_updated_by",
          "label": "Last Updated By",
          "type": "text",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "last_updated_date",
          "label": "Last Updated Date",
          "type": "date",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "last_inventory_date",
          "label": "Last Inventory Verification Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "compliance_tags",
          "label": "Compliance Tags",
          "type": "multiselect",
          "section": "main",
          "required": false
        },
        {
          "name": "roaming_compliance",
          "label": "Data Roaming Compliance",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "export_control",
          "label": "Export Control Classification",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "attachments",
          "label": "Attachments",
          "type": "file",
          "section": "main",
          "required": true
        },
        {
          "name": "notes",
          "label": "Notes/Comments",
          "type": "textarea",
          "section": "main",
          "required": false
        }
      ]
    }')
  `);

    // ==================== TABLET CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Tablet', 'Company Tablet with complete details', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Tablet Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "device_type",
          "label": "Device Type",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "manufacturer",
          "label": "Manufacturer",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "model_name",
          "label": "Model Name",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "model_number",
          "label": "Model Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "color",
          "label": "Color",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "imei_slot_1",
          "label": "IMEI Number (Slot 1)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "imei_slot_2",
          "label": "IMEI Number (Slot 2)",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "meid_esn",
          "label": "MEID/ESN",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "serial_number",
          "label": "Serial Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "sim_iccid",
          "label": "SIM Card ICCID",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "sim_type",
          "label": "Physical SIM / eSIM",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "secondary_sim_iccid",
          "label": "Secondary SIM ICCID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "wifi_mac",
          "label": "MAC Address (Wi-Fi)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "bluetooth_mac",
          "label": "Bluetooth MAC Address",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "assigned_to_name",
          "label": "Assigned To",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "operating_system",
          "label": "Operating System",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "os_version",
          "label": "OS Version",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "storage_capacity",
          "label": "Storage Capacity",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "ram",
          "label": "RAM",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "processor",
          "label": "Processor/Chipset",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "screen_size",
          "label": "Screen Size",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "battery_capacity",
          "label": "Battery Capacity",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "is_5g_capable",
          "label": "5G Capable",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "fingerprint_sensor",
          "label": "Fingerprint Sensor",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "face_unlock",
          "label": "Face Unlock",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "water_resistance",
          "label": "Water/Dust Resistance Rating",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "nfc_support",
          "label": "NFC Support",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "wireless_charging",
          "label": "Wireless Charging",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "camera_specs",
          "label": "Camera Specifications",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "network_lock_status",
          "label": "Network Lock Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "primary_carrier",
          "label": "Primary Carrier/Service Provider",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "mobile_number",
          "label": "Mobile Number (MSISDN)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "number_ported",
          "label": "Mobile Number Ported",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "plan_type",
          "label": "Plan Type",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "plan_name",
          "label": "Plan Name / Rate Plan",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "data_allowance",
          "label": "Data Allowance",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "roaming_enabled",
          "label": "International Roaming Enabled",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "roaming_restrictions",
          "label": "Roaming Restrictions",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "volte_vowifi",
          "label": "VoLTE/VoWiFi Capable",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "apn_config",
          "label": "APN Configuration",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "carrier_account",
          "label": "Carrier Account Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "billing_account",
          "label": "Billing Account ID / Cost Centre",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "contract_start_date",
          "label": "Contract Start Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "contract_end_date",
          "label": "Contract End Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "contract_renewal_date",
          "label": "Contract Renewal Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "early_termination_fee",
          "label": "Early Termination Fee",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "payment_plan",
          "label": "Device Payment Plan",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "vendor",
          "label": "Vendor/Reseller",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "purchase_date",
          "label": "Purchase Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost (Device only)",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "subsidized_cost",
          "label": "Subsidized Cost",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "total_cost_with_plan",
          "label": "Total Cost with Plan",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "cost_center",
          "label": "Cost Center / Department Budget",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "expenditure_type",
          "label": "Capital/Operational Expenditure",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "warranty_start_date",
          "label": "Warranty Start Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "warranty_end_date",
          "label": "Warranty End Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "warranty_type",
          "label": "Warranty Type",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "insurance_provider",
          "label": "Insurance Provider",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "insurance_policy_number",
          "label": "Insurance Policy Number",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "insurance_expiry_date",
          "label": "Insurance Expiry Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "insurance_coverage",
          "label": "Insurance Coverage Details",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "deductible_amount",
          "label": "Deductible Amount",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "mdm_enrolled",
          "label": "Mobile Device Management (MDM) Enrolled",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "mdm_profile",
          "label": "MDM Profile Name / Server",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "last_mdm_checkin",
          "label": "Last MDM Check-in",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "compliance_status",
          "label": "Compliance Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "encryption_status",
          "label": "Encryption Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "screen_lock_method",
          "label": "Screen Lock Method",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "min_pin_length",
          "label": "Minimum PIN Length Policy",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "passcode_compliance",
          "label": "Passcode Compliance",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "security_patch_level",
          "label": "Security Patch Level",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "installed_apps",
          "label": "Containers/Apps Installed",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "blocked_apps",
          "label": "Blacklisted/Blocked Apps",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "jailbreak_status",
          "label": "Jailbreak/Root Detection Status",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "remote_wipe_capable",
          "label": "Remote Wipe Capable",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "last_remote_wipe_test",
          "label": "Last Remote Wipe Test Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "certificate_expiry",
          "label": "Certificate Expiry",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "ownership_model",
          "label": "BYOD / Corporate-Owned",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "charger_included",
          "label": "Charger Included",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "charger_asset_id",
          "label": "Charger Asset ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "cable_included",
          "label": "Cable Included",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "case_included",
          "label": "Case Included",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "case_asset_id",
          "label": "Case Asset ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "screen_protector",
          "label": "Screen Protector Installed",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "headphones",
          "label": "Headphones/Headset",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "additional_accessories",
          "label": "Additional Accessories",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "accessory_kit_complete",
          "label": "Accessory Kit Complete",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "spare_battery",
          "label": "Spare Battery",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "condition_at_assignment",
          "label": "Device Condition at Assignment",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "current_condition",
          "label": "Current Condition",
          "type": "select",
          "section": "main",
          "required": true
        },
        {
          "name": "damage_notes",
          "label": "Damage/Cosmetic Notes",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "battery_health",
          "label": "Battery Health",
          "type": "text",
          "section": "main",
          "required": true
        },
        {
          "name": "repair_history",
          "label": "Repair History",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "last_repair_date",
          "label": "Last Repair Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "total_repair_cost",
          "label": "Total Repair Cost (Lifetime)",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "loaner_device_id",
          "label": "Loaner Device ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "replacement_device_id",
          "label": "Replacement Device ID",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "maintenance_schedule",
          "label": "Maintenance Schedule",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "expected_replacement_date",
          "label": "Expected Replacement Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "retirement_reason",
          "label": "Retirement Reason",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "retirement_date",
          "label": "Retirement Date",
          "type": "date",
          "section": "main",
          "required": false
        },
        {
          "name": "data_wipe_method",
          "label": "Data Wipe Method",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "wipe_certification",
          "label": "Data Wipe Certification",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "disposal_certificate",
          "label": "Disposal Certificate / Proof of Recycling",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "trade_in_value",
          "label": "Trade-in Value Received",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "sim_disposal",
          "label": "SIM Card Disposal",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "final_status",
          "label": "Final Status",
          "type": "select",
          "section": "main",
          "required": false
        },
        {
          "name": "record_created_by",
          "label": "Record Created By",
          "type": "text",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "record_created_date",
          "label": "Record Created Date",
          "type": "date",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "last_updated_by",
          "label": "Last Updated By",
          "type": "text",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "last_updated_date",
          "label": "Last Updated Date",
          "type": "date",
          "section": "main",
          "required": false,
          "readonly": true
        },
        {
          "name": "last_inventory_date",
          "label": "Last Inventory Verification Date",
          "type": "date",
          "section": "main",
          "required": true
        },
        {
          "name": "compliance_tags",
          "label": "Compliance Tags",
          "type": "multiselect",
          "section": "main",
          "required": false
        },
        {
          "name": "roaming_compliance",
          "label": "Data Roaming Compliance",
          "type": "textarea",
          "section": "main",
          "required": false
        },
        {
          "name": "export_control",
          "label": "Export Control Classification",
          "type": "text",
          "section": "main",
          "required": false
        },
        {
          "name": "attachments",
          "label": "Attachments",
          "type": "file",
          "section": "main",
          "required": true
        },
        {
          "name": "notes",
          "label": "Notes/Comments",
          "type": "textarea",
          "section": "main",
          "required": false
        }
      ]
    }')
  `);

    // ==================== SERVER CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Server', 'Company Server with complete details', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Server Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "asset_tag",
          "label": "Assets Tag/ID Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "server_hostname",
          "label": "Server Hostname (Primary DNS name)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "server_role",
          "label": "Server Role",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Web Server", "Database Server", "File Server", "Application Server", "Virtualization Host", "Backup Server", "others"]
        },
        {
          "name": "server_type",
          "label": "Server Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Physical", "Virtual", "Cloud", "Instance", "Container"]
        },
        {
          "name": "criticality_level",
          "label": "Criticality Level",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Tier 1/Mission Critical", "Tier 2/Business Critical", "Tier 3/Important", "Tier 4/Non-Critical"]
        },
        {
          "name": "date_commissioned",
          "label": "Date Commissioned/Provisioned",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "project_reference",
          "label": "Request/Project Reference",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "brand_manufacturer",
          "label": "Brand Manufacturer",
          "type": "select",
          "required": true,
          "section": "main",
          "options": []
        },
        {
          "name": "model_chassis",
          "label": "Model/Chassis",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "serial_number",
          "label": "Serial Number/Service Tag",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "rack_location",
          "label": "Rack Location",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Data Center", "Row", "Rack Number", "U Position", "others"]
        },
        {
          "name": "form_factor",
          "label": "Form Factor Rack Unit",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["1U", "2U", "4U", "Blade", "Tower"]
        },
        {
          "name": "chassis_slot",
          "label": "Chassis Slot/Position",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "primary_power_supply",
          "label": "Primary Power Supply",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "secondary_power_supply",
          "label": "Secondary Power Supply",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "nic_ports",
          "label": "Network Interface Cards (NICs)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ip_addresses_hardware",
          "label": "IP Address(es)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "operating_system_hardware",
          "label": "Operating System (with version)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "graphics_card",
          "label": "Graphics Card",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "screen_size",
          "label": "Screen Size",
          "type": "select",
          "required": true,
          "section": "main",
          "options": []
        },
        {
          "name": "peripherals_included",
          "label": "Peripherals Included",
          "type": "select",
          "required": true,
          "section": "main",
          "options": []
        },
        {
          "name": "cpu_type_model",
          "label": "CPU Type & Model",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cpu_sockets",
          "label": "CPU Sockets",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "total_cores",
          "label": "Total Cores",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "total_threads",
          "label": "Total Threads",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ram_total",
          "label": "RAM (Total GB)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ram_configuration",
          "label": "RAM Configuration",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "gpu_cards",
          "label": "GPU/Accelerator Cards",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "storage_controller",
          "label": "Internal Storage Controller",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "raid_level",
          "label": "RAID Level/Configuration",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "raw_storage_capacity",
          "label": "Total Raw Storage Capacity (TB)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "usable_storage_capacity",
          "label": "Total Usable Storage Capacity (TB)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "drive_bays",
          "label": "Drive Bays & Configuration",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "external_storage",
          "label": "External Storage Attached",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "management_ip",
          "label": "Management IP Address",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "primary_ip",
          "label": "Primary IP Address(es)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "secondary_ip",
          "label": "Secondary IP Address(es)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "mac_addresses",
          "label": "MAC Addresses",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "network_interfaces",
          "label": "Network Interfaces",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "switch_port_connections",
          "label": "Switch Port Connections",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vlan_assignments",
          "label": "VLAN Assignments",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "hypervisor",
          "label": "Hypervisor",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "hypervisor_version",
          "label": "Hypervisor Version/License Key",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vm_name",
          "label": "Virtual Machine Name",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "virtual_host_cluster",
          "label": "Virtual Host/Cluster",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "guest_os",
          "label": "Guest Operating System",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "os_version",
          "label": "OS Version & Edition",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "os_license_key_vm",
          "label": "OS License Key (if applicable)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assigned_vcpu",
          "label": "Assigned vCPU/Cores",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assigned_memory",
          "label": "Assigned Memory",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assigned_virtual_disks",
          "label": "Assigned Virtual Disks",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "primary_application",
          "label": "Primary Application/Service",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "application_owner",
          "label": "Application Owner/Team",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Owner", "Team"]
        },
        {
          "name": "dependent_services",
          "label": "Dependent Services",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "dependencies",
          "label": "Dependencies",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "backup_configuration",
          "label": "Backup Configuration",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "monitoring_system",
          "label": "Monitoring System",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "monitoring_contact",
          "label": "Monitoring Alerts Contact",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cost_center",
          "label": "Cost Center/Department",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "business_justification",
          "label": "Business Justification/Purpose",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "vendor_name",
          "label": "Vendor/Supplier Name",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_start",
          "label": "Warranty Start Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_end",
          "label": "Warranty End Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "expected_lifespan",
          "label": "Expected Lifespan",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assigned_to",
          "label": "Assigned To",
          "type": "select",
          "required": true,
          "section": "main",
          "options": []
        },
        {
          "name": "managed_by",
          "label": "Managed By",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assigned_date",
          "label": "Assigned Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "server_mode_status",
          "label": "Status (Server Mode)",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["In Production", "Staging", "Testing", "Decommissioned", "Spare", "Others"]
        },
        {
          "name": "physical_location",
          "label": "Physical Location",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Building", "Floor", "Room", "Desk Number"]
        },
        {
          "name": "status",
          "label": "Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["New", "In Use", "In Stock/Spare", "In Repair", "Retired", "Lost/Stolen", "Disposed"]
        },
        {
          "name": "operating_system_compliance",
          "label": "Operating System (with version)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "os_license_key_compliance",
          "label": "OS License Key",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "virtualization_platform",
          "label": "Virtualization Platform",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "hypervisor_details",
          "label": "Hypervisor Details",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "server_role_compliance",
          "label": "Server Role",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["SQL Server", "Web Server", "File Server", "others"]
        },
        {
          "name": "ip_addresses_compliance",
          "label": "IP Addresses",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "subnet_vlan",
          "label": "Subnet/VLAN",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "backup_schedule",
          "label": "Backup Schedule",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ownership_type",
          "label": "Owned vs. Leased",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Owned", "Leased", "Rented", "Contract"]
        },
        {
          "name": "lease_expiry",
          "label": "Lease Expiry Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "next_maintenance",
          "label": "Next Maintenance Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_date",
          "label": "Decommission/Disposal Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Sold", "Recycled", "Donated", "E-Waste", "Return to Lessor"]
        },
        {
          "name": "depreciation_value",
          "label": "Depreciation Value",
          "type": "number",
          "required": false,
          "section": "main"
        },
        {
          "name": "parent_asset",
          "label": "Parent Asset",
          "type": "select",
          "required": false,
          "section": "main",
          "options": []
        },
        {
          "name": "cloud_provider",
          "label": "Cloud Provider",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["AWS", "Azure", "GCP", "Others"]
        },
        {
          "name": "region_zone",
          "label": "Region/Availability Zone",
          "type": "select",
          "required": true,
          "section": "main",
          "options": []
        },
        {
          "name": "instance_type",
          "label": "Instance Type/Size",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "instance_id",
          "label": "Instance ID",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "resource_group",
          "label": "Resource Group/VPC",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cloud_account",
          "label": "Cloud Account/Subscription",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "monthly_cost",
          "label": "Monthly Cost Estimate",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "auto_scaling_group",
          "label": "Auto-scaling Group",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "snapshot_policy",
          "label": "Snapshot/Image Policy",
          "type": "text",
          "required": true,
          "section": "main"
        }
      ]
    }')
  `);

    // ==================== CAR CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Car', 'Company vehicles and cars with complete details', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Car Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "asset_tag",
          "label": "Assets Tag/ID",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vehicle_type",
          "label": "Vehicle Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Sedan", "SUV", "Truck", "Van", "Pickup-Truck", "Forklift", "Golf-Cart", "Motorcycle", "Bus", "Trailer", "Heavy-Equipment", "Special-Equipment", "other"]
        },
        {
          "name": "make_manufacturer",
          "label": "Make/Manufacturer",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "model",
          "label": "Model",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "year",
          "label": "Year",
          "type": "year",
          "required": true,
          "section": "main"
        },
        {
          "name": "color",
          "label": "Color",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vin",
          "label": "Vehicle Identification Number (VIN)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "license_plate",
          "label": "License Plate Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "registration_state",
          "label": "Registration State/Province",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "registration_certificate",
          "label": "Registration Certificate Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "engine_number",
          "label": "Engine Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "engine_type",
          "label": "Engine Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in-Hybrid", "CNG", "LPG", "Hydrogen", "other"]
        },
        {
          "name": "engine_size",
          "label": "Engine Size/Displacement",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "transmission_type",
          "label": "Transmission Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Automatic", "Manual", "CVT", "Semi-Automatic", "Dual-Clutch", "Direct-Drive"]
        },
        {
          "name": "fuel_type",
          "label": "Fuel Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Regular", "Premium", "Diesel", "Electric", "CNG", "LPG", "Hybrid", "other"]
        },
        {
          "name": "fuel_capacity",
          "label": "Fuel Tank/Battery Capacity",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "odometer_reading",
          "label": "Odometer Reading (Current)",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "odometer_unit",
          "label": "Odometer Unit",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Miles", "Kilometers", "Hours"]
        },
        {
          "name": "seating_capacity",
          "label": "Seating Capacity",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "cargo_capacity",
          "label": "Cargo Capacity",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "gvwr",
          "label": "Gross Vehicle Weight Rating",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vehicle_class",
          "label": "Vehicle Class",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Compact", "Midsize", "Full-size", "SUV", "Minivan", "Pickup", "Heavy-Duty", "Commercial", "Luxury", "Sports", "Off-road"]
        },
        {
          "name": "assigned_driver",
          "label": "Assigned Driver/Rider",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "employee_id_department",
          "label": "Employee ID/Department",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assignment_date",
          "label": "Assignment Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "primary_use",
          "label": "Primary Use",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Business-Travel", "Sales-Route", "Delivery", "Executive-Transport", "Pool-Vehicle", "Maintenance", "Security-Patrol", "Shuttle-Service", "Construction-Site", "Warehouse-Operations", "Emergency-Response", "Rental", "other"]
        },
        {
          "name": "home_location",
          "label": "Home Location/Parking Spot",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "authorized_drivers",
          "label": "Authorized Drivers List",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "usage_restrictions",
          "label": "Usage Restrictions",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "tracking_device_id",
          "label": "Tracking Device ID",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchased_from",
          "label": "Purchased From",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Dealership", "Auction", "Private-Sale", "Fleet-Vendor", "Government-Surplus", "Online-Marketplace", "Manufacturer-Direct", "Lease-Company", "other"]
        },
        {
          "name": "purchase_date",
          "label": "Purchase Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_price",
          "label": "Purchase Price",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "current_market_value",
          "label": "Current Market Value",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "lease_rental",
          "label": "Lease/Rental",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Yes", "No", "Rental", "Finance"]
        },
        {
          "name": "lease_company",
          "label": "Lease Company",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "lease_start_date",
          "label": "Lease Start Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "lease_end_date",
          "label": "Lease End Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "monthly_lease_payment",
          "label": "Monthly Lease Payment",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "mileage_allowance",
          "label": "Mileage Allowance",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "depreciation_schedule",
          "label": "Depreciation Schedule",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cost_center",
          "label": "Cost Center/Department Budget",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "residual_value",
          "label": "Residual Value",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "insurance_company",
          "label": "Insurance Company",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "policy_number",
          "label": "Policy Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "insurance_coverage",
          "label": "Insurance Type/Coverage",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Comprehensive", "Third-Party", "Collision", "Liability", "Full-Coverage", "Commercial-Auto", "Fleet-Insurance", "Cargo-Insurance", "Uninsured-Motorist", "Personal-Injury", "No-Insurance"]
        },
        {
          "name": "insurance_expiry",
          "label": "Insurance Expiry Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "premium_amount",
          "label": "Premium Amount",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "deductible_amount",
          "label": "Deductible Amount",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "insurance_card_location",
          "label": "Insurance Card Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "registration_expiry",
          "label": "Registration Expiry Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "annual_registration_fee",
          "label": "Annual Registration Fee",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "emission_test",
          "label": "Emission Test/Certificate",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "safety_inspection",
          "label": "Safety Inspection Certificate",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "service_center",
          "label": "Preferred Service Center/Dealer",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_type",
          "label": "Warranty Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Manufacturer", "Extended", "Certified-Pre-Owned", "Powertrain", "Bumper-to-Bumper", "No-Warranty"]
        },
        {
          "name": "warranty_expiry",
          "label": "Warranty Expiry Date/Mileage",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_coverage",
          "label": "Warranty Coverage Details",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "maintenance_interval",
          "label": "Maintenance Schedule Interval",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "last_service_date",
          "label": "Last Service Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "last_service_type",
          "label": "Last Service Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Oil-Change", "Tire-Rotation", "Brake-Service", "Battery-Replacement", "Tire-Replacement", "General-Maintenance", "Major-Service", "Transmission-Service", "Coolant-Flush", "Air-Filter-Replacement", "Wheel-Alignment", "other"]
        },
        {
          "name": "last_service_odometer",
          "label": "Last Service Odometer",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "next_service_due",
          "label": "Next Service Due Date/Mileage",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "tire_info",
          "label": "Tire Information",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "battery_info",
          "label": "Battery Information",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "brake_pads",
          "label": "Brake Pad Last Changed",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "fuel_card",
          "label": "Fuel Card/Account Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "fuel_efficiency",
          "label": "Average Fuel Efficiency",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "fuel_budget",
          "label": "Monthly Fuel Budget/Cost",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "last_fueling_date",
          "label": "Last Fueling Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "ev_charger_type",
          "label": "Electric Vehicle Charger Type",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Level-1", "Level-2", "DC-Fast", "Tesla-Supercharger", "Not-EV", "Hybrid-Only"]
        },
        {
          "name": "charger_card_id",
          "label": "Charging Station Access Card ID",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "m_gtag",
          "label": "M-GTag",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "parking_permit",
          "label": "Parking Permit Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "parking_cost",
          "label": "Monthly Parking Cost",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "safety_equipment",
          "label": "Safety Equipment Check",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "spare_key_location",
          "label": "Spare Key Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "anti_theft_device",
          "label": "Anti-Theft Device",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "dash_cam",
          "label": "Dash Cam Installed",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Yes", "No", "Front-Only", "Front-Rear", "360-Degree", "GPS-Enabled"]
        },
        {
          "name": "emergency_contact",
          "label": "Emergency Contact Information",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "damage_history",
          "label": "Current Damage/Scratches",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "traffic_violations",
          "label": "Traffic Violations/Fines",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "theft_reports",
          "label": "Theft/Vandalism Reports",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "accident_history",
          "label": "Accident History",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "insurance_claim_history",
          "label": "Insurance Claim History",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "vehicle_status",
          "label": "Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Active", "In-Maintenance", "In-Accident-Repair", "Retired", "Sold", "Stored", "For-Sale", "Writen-Off", "Stolen"]
        },
        {
          "name": "replacement_date",
          "label": "Expected Replacement Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "replacement_mileage",
          "label": "Expected Replacement Mileage",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "retirement_reason",
          "label": "Retirement Reason",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Age", "Mileage", "Excessive-Repairs", "Accident", "Mechanical-Failure", "Fleet-Upgrade", "Cost-Reduction", "Environmental", "Company-Policy", "Not-Retired"]
        },
        {
          "name": "sold_date",
          "label": "Sold Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "sold_price",
          "label": "Sold Price",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "buyer_info",
          "label": "Buyer Information",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Auction", "Trade-In", "Donation", "Scrap", "Private-Sale", "Employee-Sale", "Parts-Harvesting", "Still-in-Fleet", "Not-Disposed"]
        },
        {
          "name": "owners_manual_location",
          "label": "Owner''s Manual Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "service_manual_location",
          "label": "Service Manual Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "maintenance_log_location",
          "label": "Maintenance Log Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vehicle_photos",
          "label": "Vehicle Photos",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "compliance_stickers",
          "label": "Compliance Stickers",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "dot_requirements",
          "label": "DOT Requirements",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "cdl_requirements",
          "label": "CDL Requirements",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["CDL-Class-A", "CDL-Class-B", "CDL-Class-C", "Non-CDL", "Commercial-License", "Special-Endorsement", "Hazmat", "Passenger"]
        },
        {
          "name": "record_created_by",
          "label": "Record Created By",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "record_created_date",
          "label": "Record Created Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "last_updated_by",
          "label": "Last Updated By",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_updated_date",
          "label": "Last Updated Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "next_review_date",
          "label": "Next Review Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "notes",
          "label": "Notes/Additional Information",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "attachments",
          "label": "Attachments",
          "type": "file",
          "required": true,
          "section": "main"
        }
      ]
    }')
  `);

    // ==================== BICYCLE CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Bicycle', 'Company bicycles with complete details', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Bicycle Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "asset_tag",
          "label": "Assets Tag/ID",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "manufacturer_brand",
          "label": "Manufacturer/Brand",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "model_name",
          "label": "Model Name/Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "model_year",
          "label": "Model Year",
          "type": "year",
          "required": true,
          "section": "main"
        },
        {
          "name": "frame_serial_number",
          "label": "Frame Serial Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "frame_size",
          "label": "Frame Size",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "wheel_size",
          "label": "Wheel Size",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["26-inch", "27.5-inch", "29-inch", "700c", "650b", "20-inch", "24-inch", "16-inch", "12-inch", "other"]
        },
        {
          "name": "tire_type",
          "label": "Tire Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Road", "Knobby", "Hybrid", "Puncture-resistant", "Fat", "Touring", "Cyclocross", "Tubeless"]
        },
        {
          "name": "brake_type",
          "label": "Brake Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["V-brake", "Caliper", "Disc-Mechanical", "Disc-Hydraulic", "Coaster", "Cantilever", "Drum", "Regenerative"]
        },
        {
          "name": "gearing_system",
          "label": "Gearing System",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Derailleur", "Hub-gear", "Single-speed", "Belt-drive", "Continuous", "Electronic"]
        },
        {
          "name": "number_of_gears",
          "label": "Number of Gears",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "shifters",
          "label": "Shifters",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Grip-shift", "Trigger", "Integrated", "Downtube", "Bar-end", "Electronic", "Single-speed"]
        },
        {
          "name": "weight",
          "label": "Weight",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "motor_type",
          "label": "Motor Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Hub-Front", "Hub-Rear", "Mid-Drive", "Friction", "Geared-Hub", "Direct-Drive"]
        },
        {
          "name": "motor_power",
          "label": "Motor Power",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "battery_capacity",
          "label": "Battery Capacity",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "battery_serial_number",
          "label": "Battery Model/Serial Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "charger_serial_number",
          "label": "Charger Model/Serial Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "estimated_range",
          "label": "Estimated Range",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assist_levels",
          "label": "Assist Levels",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "display_model",
          "label": "Display/Controller Model",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "battery_key_number",
          "label": "Battery Removal Key Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vendor_dealer",
          "label": "Vendor/Dealer",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_date",
          "label": "Purchase Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "delivery_assembly_cost",
          "label": "Delivery/Assembly Cost",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "cost_center",
          "label": "Cost Center/Department",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_expiry",
          "label": "Warranty Expiry Date",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "insurance_policy_number",
          "label": "Insurance Policy Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "insurance_expiry",
          "label": "Insurance Expiry Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "assigned_to",
          "label": "Assigned To",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assignment_date",
          "label": "Assignment Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "expected_return_date",
          "label": "Expected Return Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "primary_purpose",
          "label": "Primary Purpose",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Commuting", "On-campus-transit", "Deliveries", "Maintenance-rounds", "Recreation", "Training", "Security-patrol", "Fleet-demo", "Pool-vehicle", "other"]
        },
        {
          "name": "home_location",
          "label": "Home Location/Storage Area",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "lock_combination",
          "label": "Lock Combination/Key ID",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "gps_tracker_id",
          "label": "GPS Tracker ID",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "previous_assignees",
          "label": "Previous Assignee(s)",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "safety_equipment",
          "label": "Safety Equipment",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "helmet_location",
          "label": "Helmet Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "safety_notes",
          "label": "Safety Notes",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "current_condition",
          "label": "Current Condition",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["New", "Excellent", "Good", "Fair", "Poor", "Needs-Repair", "Under-Repair"]
        },
        {
          "name": "last_service_date",
          "label": "Last Service Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "last_service_type",
          "label": "Last Service Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Full-tune-up", "Brake-adjustment", "Tire-replacement", "Chain-replacement", "Gear-adjustment", "Wheel-truing", "Battery-service", "Motor-service", "General-maintenance", "Safety-check", "other"]
        },
        {
          "name": "last_service_odometer",
          "label": "Last Service Odometer",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "next_service_due",
          "label": "Next Service Due Date/Mileage",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "service_interval",
          "label": "Service Interval",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "preferred_shop",
          "label": "Preferred Service Shop/Mechanic",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "service_history_log",
          "label": "Service History Log",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "chain_lube_schedule",
          "label": "Chain Lubrication Schedule",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "brake_pad_replacement_date",
          "label": "Brake Pad Replacement Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "battery_health_check_date",
          "label": "Battery Health Check Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "accident_history",
          "label": "Accident/Incident History",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "current_damage",
          "label": "Current Damage/Scratches",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "theft_report",
          "label": "Theft Report Reference",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "stolen_status",
          "label": "Stolen/Recovered Status",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Not-Stolen", "Stolen-Reported", "Stolen-Under-Investigation", "Recovered-Intact", "Recovered-Damaged", "Recovered-Parts-Missing", "Never-Recovered"]
        },
        {
          "name": "vandalism_report",
          "label": "Vandalism Report",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "bicycle_status",
          "label": "Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Active", "In-Repair", "In-Storage", "Retired", "Stolen", "Disposed", "Under-Assessment", "Pending-Disposal"]
        },
        {
          "name": "replacement_date",
          "label": "Expected Replacement Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "retirement_reason",
          "label": "Retirement Reason",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Worn-out", "Damaged", "Upgrade", "Surplus", "Stolen", "Parts-donor", "Fleet-reduction", "Not-retired"]
        },
        {
          "name": "disposal_date",
          "label": "Disposal Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Donated", "Sold", "Recycled", "Trade-in", "Parts-harvested", "Auction", "Employee-sale", "Not-disposed"]
        },
        {
          "name": "donation_recipient",
          "label": "Donation Recipient / Buyer",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "resale_value",
          "label": "Resale Value Received",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_certificate",
          "label": "Disposal Certificate",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "owners_manual_location",
          "label": "Owner''s Manual Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assembly_instructions",
          "label": "Assembly Instructions Reference",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "proof_of_purchase",
          "label": "Proof of Purchase",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "local_registration",
          "label": "Registration with Local Authority",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "safety_certification",
          "label": "Safety Certification",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "bike_registration_id",
          "label": "Bike Registration Database ID",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "photographs",
          "label": "Photographs",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "record_created_by",
          "label": "Record Created By",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "record_created_date",
          "label": "Record Created Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_updated_by",
          "label": "Last Updated By",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_updated_date",
          "label": "Last Updated Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_inventory_check",
          "label": "Last Physical Inventory Check Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "notes",
          "label": "Notes/Comments",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "attachments",
          "label": "Attachments",
          "type": "file",
          "required": true,
          "section": "main"
        }
      ]
    }')
  `);

    // ==================== NETWORKING EQUIPMENT CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Networking', 'Networking equipment including switches, routers, firewalls and access points', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Networking Equipment Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "asset_tag",
          "label": "Assets Tag/ID Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "device_hostname",
          "label": "Device Hostname",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "device_type",
          "label": "Device Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Switch", "Router", "Firewall", "Wireless Access Point", "Wireless Controller", "Load Balancer", "Modem", "Media Converter", "Network Appliance", "SAN Switch", "KVM/IP KVM"]
        },
        {
          "name": "sub_type",
          "label": "Sub-Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Core Switch", "Distribution Switch", "Access Switch", "Edge Router", "VPN Concentrator"]
        },
        {
          "name": "brand_manufacturer",
          "label": "Brand Manufacturer",
          "type": "select",
          "required": true,
          "section": "main"
        },
        {
          "name": "model_number",
          "label": "Model Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "serial_number",
          "label": "Serial Number/Chassis ID",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "date_deployed",
          "label": "Date Deployed/Commissioned",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "request_ticket",
          "label": "Request Ticket/Reference Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assigned_to",
          "label": "assigned To",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "form_factor",
          "label": "Form Factor",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["1U", "2U", "Chassis-based", "Wall-mount", "Desktop"]
        },
        {
          "name": "chassis_model",
          "label": "Chassis Model",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "slot_module_config",
          "label": "Slot/Module Configuration",
          "type": "select",
          "required": true,
          "section": "main",
          "options": []
        },
        {
          "name": "power_supply_details",
          "label": "Power Supply Details",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cooling_details",
          "label": "Cooling/Fan Tray Details",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "rack_location",
          "label": "Rack Location",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Data Center", "IDF", "MDF", "Closet Name"]
        },
        {
          "name": "rack_position",
          "label": "Rack Number & U Position",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "physical_port_count",
          "label": "Physical Port Count",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "port_types",
          "label": "Port Types",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "management_ip_primary",
          "label": "Management IP Address (Primary)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "oob_management_ip",
          "label": "Out-of-Band Management IP",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "management_interface",
          "label": "Management Interface",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["vlan1", "mgmt0", "me0", "other"]
        },
        {
          "name": "management_vlan",
          "label": "Management VLAN",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "mac_address",
          "label": "MAC Address (Base MAC/System MAC)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "default_gateway",
          "label": "Default Gateway",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "dns_servers",
          "label": "DNS Servers",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "domain_name",
          "label": "Domain Name",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "configured_hostname",
          "label": "Configured Hostname",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "network_role",
          "label": "Network Role",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Core", "Distribution", "Access", "Edge", "DMZ", "Management"]
        },
        {
          "name": "network_os",
          "label": "Network OS",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["IOS-XE", "NX-OS", "JunOS", "ScreenOS", "PanOS", "IOS", "IOS-XR", "FTOS", "EOS", "other"]
        },
        {
          "name": "os_version",
          "label": "OS Version",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "config_register",
          "label": "Configuration Register/BOOT Version",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "licensed_features",
          "label": "Licensed Features",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "license_keys",
          "label": "License Keys/Authorization Codes",
          "type": "password",
          "required": true,
          "section": "main"
        },
        {
          "name": "license_expiry",
          "label": "Feature License Expiration Dates",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "last_firmware_update",
          "label": "Last Firmware Update Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "next_scheduled_update",
          "label": "Next Scheduled Update",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "config_backup_location",
          "label": "Configuration File Location/Backup Path",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "uplink_device",
          "label": "Uplink Device",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "uplink_port_remote",
          "label": "Uplink Port (Remote device port)",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "local_uplink_port",
          "label": "Local Uplink Port",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "uplink_speed_media",
          "label": "Uplink Speed & Media",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["10MbE-copper", "100MbE-copper", "1GbE-copper", "1GbE-fiber", "10GbE-fiber", "25GbE-fiber", "40GbE-fiber", "100GbE-fiber", "other"]
        },
        {
          "name": "circuit_wan",
          "label": "Circuit/WAN Connection",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vlan_config",
          "label": "VLAN Database/Trunk Configuration",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "stp_role",
          "label": "STP/RSTP Root Role",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Root Bridge", "Secondary Root", "Designated Port", "Alternate Port", "Backup Port", "Disabled", "Not Applicable"]
        },
        {
          "name": "routing_protocols",
          "label": "Routing Protocol Participation",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "management_access_methods",
          "label": "Management Access Methods",
          "type": "multiselect",
          "required": true,
          "section": "main",
          "options": ["SSH", "HTTPS", "HTTP", "SNMP", "Console", "Telnet", "API", "other"]
        },
        {
          "name": "tacacs_radius_server",
          "label": "TACACS/RADIUS Server",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "snmp_community_strings",
          "label": "SNMP Community Strings",
          "type": "password",
          "required": true,
          "section": "main"
        },
        {
          "name": "syslog_server",
          "label": "Syslog Server Destination",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "netflow_collector",
          "label": "NetFlow/IPFIX Collector",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "access_lists",
          "label": "Access Control Lists Applied",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "security_zone",
          "label": "Security Zone/Context",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Inside", "Outside", "DMZ", "Trust", "Untrust", "Management", "Guest", "Data", "Voice"]
        },
        {
          "name": "compliance_standards",
          "label": "Compliance Standards",
          "type": "multiselect",
          "required": false,
          "section": "main",
          "options": ["PCI-DSS", "NIST", "HIPAA", "GDPR", "SOX", "ISO-27001", "CIS", "other"]
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vendor_reseller",
          "label": "Vendor/Reseller",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_date",
          "label": "Purchase Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "cost_center",
          "label": "Cost Center/Department",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "warranty_dates",
          "label": "Warranty Start/End Dates",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "support_contract_number",
          "label": "SmartNet/Support Contract Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "support_level",
          "label": "Support Level",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["8x5", "8x5xNBD", "24x7", "24x7x4", "24x7x2", "SmartNet", "no-support"]
        },
        {
          "name": "support_expiry",
          "label": "Support Expiry Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "lease_terms",
          "label": "Lease/Rental Terms",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "ap_name_ssid",
          "label": "AP Name/SSID Broadcast Name",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "radio_types",
          "label": "Radio Types",
          "type": "multiselect",
          "required": true,
          "section": "main",
          "options": ["802.11a", "802.11b", "802.11g", "802.11n", "802.11ac", "802.11ax", "802.11be"]
        },
        {
          "name": "radio_channels",
          "label": "Radio Channels/Frequencies",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "transmit_power",
          "label": "Transmit Power Settings",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "controller_type",
          "label": "Controller Managed/Standalone",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Controller-Managed", "Standalone", "Cloud-Managed", "Mesh"]
        },
        {
          "name": "wireless_controller",
          "label": "Wireless Controller Name",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "connected_clients",
          "label": "Number of Connected Clients",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ssids_supported",
          "label": "SSIDs Supported",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "security_policy_count",
          "label": "Security Policy Count",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vpn_tunnel_capacity",
          "label": "VPN Tunnel Capacity",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "concurrent_sessions",
          "label": "Concurrent Sessions Capacity",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "threat_prevention_license",
          "label": "Threat Prevention License",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "url_filtering_license",
          "label": "URL Filtering License",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ips_signature_version",
          "label": "IPS/IDS Signature Version",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "security_zone_config",
          "label": "Security Zone Configuration",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ha_role",
          "label": "High Availability Role",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Active", "Passive", "Active-Active", "Active-Passive", "Standalone", "Primary", "Secondary"]
        },
        {
          "name": "device_status",
          "label": "Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Active", "Standby", "In-Maintenance", "Decommissioned", "Retired", "Quarantined", "Test"]
        },
        {
          "name": "criticality_level",
          "label": "Criticality Level",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Tier-1", "Tier-2", "Tier-3", "Tier-4", "Non-Critical"]
        },
        {
          "name": "planned_replacement_date",
          "label": "Planned Replacement Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "eol_date",
          "label": "End-of-Life Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "eos_date",
          "label": "End-of-Support Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "decommission_date",
          "label": "Decommission Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "replacement_asset_tag",
          "label": "Replacement Asset Tag",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Secure-Wipe", "Physical-Destruction", "Resale", "Donate", "Recycle", "Return-to-Vendor", "Not-Disposed"]
        },
        {
          "name": "primary_admin_team",
          "label": "Primary Administrator/Team",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Network-Team", "Security-Team", "Infrastructure-Team", "IT-Operations", "NOC", "SOC", "External-Vendor", "other"]
        },
        {
          "name": "oncall_contact",
          "label": "On-Call Contact",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vendor_support_contact",
          "label": "Vendor Support Contact",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "notes",
          "label": "Notes/Configuration Details",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "rack_diagram_ref",
          "label": "Rack Diagram Reference",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "network_diagram_ref",
          "label": "Network Diagram Reference",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "attachments",
          "label": "Attachments",
          "type": "file",
          "required": true,
          "section": "main"
        },
        {
          "name": "record_created",
          "label": "Record Created By & Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "last_updated",
          "label": "Last Updated By & Date",
          "type": "date",
          "required": true,
          "section": "main"
        }
      ]
    }')
  `);

    // ==================== FURNITURE CATEGORY ====================
    await tenantDb.execute(`
    INSERT INTO asset_categories (name, description, fields_definition) VALUES 
    ('Furniture', 'Office furniture including desks, chairs, cabinets and other furnishings', 
    '{
      "sections": [
        {
          "id": "main",
          "label": "Furniture Details",
          "order": 1
        }
      ],
      "fields": [
        {
          "name": "asset_tag",
          "label": "Assets Tag/ID",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "item_type",
          "label": "Item Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Desk", "Chair", "Cabinet", "Bookshelf", "Table", "Sofa", "Whiteboard", "Filing-Cabinet", "Conference-Table", "Office-Partition", "Storage-Shelf", "Reception-Desk", "Workstation", "Ergonomic-Chair", "Coffee-Table", "Monitor-Stand", "other"]
        },
        {
          "name": "category",
          "label": "Category",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Seating", "Storage", "Workstation", "Meeting", "Collaborative", "Recreational", "Office-Desk", "Conference", "Reception", "Filing", "Display", "Ergonomic"]
        },
        {
          "name": "brand_manufacturer",
          "label": "Brand Manufacturer",
          "type": "select",
          "required": true,
          "section": "main"
        },
        {
          "name": "model_product_line",
          "label": "Model/Product Line",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "serial_number",
          "label": "Serial Number/Product Code",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "color_finish",
          "label": "Color/Finish",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "material",
          "label": "Material",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Wood", "Metal", "Glass", "Fabric", "Laminate", "Composite", "Plastic", "Leather", "Vinyl", "MDF", "Particle-Board", "Mesh", "Mixed"]
        },
        {
          "name": "dimensions",
          "label": "Dimensions",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "weight",
          "label": "Weight",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assembly_required",
          "label": "Assembly Required",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Yes", "No", "Partially-Assembled", "Professional-Assembly", "Tool-Free-Assembly"]
        },
        {
          "name": "assembly_instructions_location",
          "label": "Assembly Instructions Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "modular_configurable",
          "label": "Modular/Configurable",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Yes", "No", "Panel-System", "Modular-Desk", "Configurable-Layout", "Add-on-Components"]
        },
        {
          "name": "number_of_pieces",
          "label": "Number of Pieces/Components",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "weight_capacity",
          "label": "Weight Capacity",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "ergonomic_certification",
          "label": "Ergonomic Certification",
          "type": "multiselect",
          "required": false,
          "section": "main",
          "options": ["BIFMA", "ANSI", "ISO-9241", "GREENGUARD", "EU-Ergonomic", "OSHA-Compliant", "No-Certification"]
        },
        {
          "name": "fire_safety_rating",
          "label": "Fire Safety Rating",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "current_location",
          "label": "Current Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assigned_to",
          "label": "Assigned To",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assignment_date",
          "label": "Assignment Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "shared_common_area",
          "label": "Shared/Common Area",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Yes", "No", "Department-Shared", "Team-Area", "Conference-Only", "Hot-Desk"]
        },
        {
          "name": "space_floor_plan_ref",
          "label": "Space/Floor Plan Reference",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "previous_location",
          "label": "Previous Location",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "storage_location",
          "label": "Storage Location",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "po_number",
          "label": "Purchase Order Number",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "vendor_dealer",
          "label": "Vendor/Dealer",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_date",
          "label": "Purchase Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "purchase_cost",
          "label": "Purchase Cost",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "delivery_date",
          "label": "Delivery Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "installation_date",
          "label": "Installation Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "delivery_installation_cost",
          "label": "Delivery/Installation Cost",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "cost_center",
          "label": "Cost Center/Department Budget",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "expenditure_type",
          "label": "Capital/Operational Expenditure",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["CapEx", "OpEx", "Both", "Lease", "Rental"]
        },
        {
          "name": "condition_status",
          "label": "Condition Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["New", "Excellent", "Good", "Fair", "Poor", "Damaged", "Under-Repair", "Obsolete"]
        },
        {
          "name": "condition_notes",
          "label": "Condition Notes",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_inspection_date",
          "label": "Last Inspection Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "next_inspection_date",
          "label": "Next Inspection Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "cleaning_schedule",
          "label": "Cleaning/Maintenance Schedule",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_cleaning_date",
          "label": "Last Cleaning Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "warranty_info",
          "label": "Warranty Information",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "warranty_expiry",
          "label": "Warranty Expiry Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "repair_history",
          "label": "Repair History",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "cleaning_instructions",
          "label": "Cleaning Instructions/Chemicals",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "adjustable_height",
          "label": "Adjustable Height",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Yes", "No", "Pneumatic", "Mechanical", "Electric"]
        },
        {
          "name": "lumbar_support",
          "label": "Lumbar Support",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "armrests",
          "label": "Armrests",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Adjustable", "Fixed", "None", "3D-Adjustable", "4D-Adjustable", "Padded", "Flip-up"]
        },
        {
          "name": "seat_depth_width",
          "label": "Seat Depth/Width",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "tilt_mechanism",
          "label": "Tilt Mechanism",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Knee-Tilt", "Center-Tilt", "Synchro-Tilt", "Multi-Tilt", "Rocking", "No-Tilt", "Lockable"]
        },
        {
          "name": "casters_type",
          "label": "Casters/Wheels Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Hard-Floor", "Carpet", "Dual-Wheel", "Locking", "Rubber", "Polyurethane", "No-Casters", "Glides"]
        },
        {
          "name": "gas_lift_functioning",
          "label": "Gas Lift Functioning",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Yes", "No", "Not-Applicable", "Needs-Replacement", "Class-3", "Class-4"]
        },
        {
          "name": "ada_compliant",
          "label": "ADA Compliant",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Yes", "No", "Adaptable", "Pending"]
        },
        {
          "name": "standing_desk_feature",
          "label": "Standing Desk Feature",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Electric", "Manual-Crank", "Pneumatic", "Fixed", "Desktop-Riser", "Not-Desk"]
        },
        {
          "name": "number_of_drawers",
          "label": "Number of Drawers",
          "type": "number",
          "required": true,
          "section": "main"
        },
        {
          "name": "locking_mechanism",
          "label": "Locking Mechanism",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Key-Lock", "Combination", "Digital-Keypad", "Biometric", "Cam-Lock", "Central-Locking", "No-Lock", "Master-Keyed", "RFID"]
        },
        {
          "name": "number_of_keys",
          "label": "Number of Keys",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "shelf_adjustability",
          "label": "Shelf Adjustability",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Adjustable", "Fixed", "Semi-Adjustable", "Removable", "Sliding", "No-Shelves", "Not-Applicable"]
        },
        {
          "name": "fireproof_rating",
          "label": "Fireproof/Waterproof Rating",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "file_hanging_capacity",
          "label": "File Hanging Capacity",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "expected_lifespan",
          "label": "Expected Lifespan",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "depreciation_schedule",
          "label": "Depreciation Schedule",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Straight-Line", "Accelerated", "Double-Declining", "Sum-of-Years", "MACRS", "No-Depreciation"]
        },
        {
          "name": "current_book_value",
          "label": "Current Book Value",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "replacement_cost_estimate",
          "label": "Replacement Cost Estimate",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "planned_replacement_date",
          "label": "Planned Replacement Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "furniture_status",
          "label": "Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Active", "In-Repair", "Surplus", "Retired", "Donated", "Sold", "In-Storage", "Pending-Disposal"]
        },
        {
          "name": "retirement_reason",
          "label": "Retirement Reason",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Worn-Out", "Damaged", "Outdated", "Surplus", "Replaced", "Office-Renovation", "Space-Optimization", "Donated", "Sold", "Not-Retired"]
        },
        {
          "name": "safety_inspection_date",
          "label": "Safety Inspection Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "safety_issues",
          "label": "Safety Issues/Concerns",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "recall_status",
          "label": "Recall Status",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["No-Recall", "Under-Investigation", "Recall-Announced", "Remedied", "Pending-Action", "Not-Checked"]
        },
        {
          "name": "weight_limit_labels",
          "label": "Load/Weight Limit Labels",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Visible", "Applied", "Faded", "Missing", "Not-Applicable"]
        },
        {
          "name": "assembly_safety_check",
          "label": "Assembly Safety Check",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "electrical_certification",
          "label": "Electrical Certification",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "equipment_type",
          "label": "Equipment Type",
          "type": "select",
          "required": true,
          "section": "main",
          "options": ["Copier", "Printer", "Shredder", "Water-Cooler", "Microwave", "Refrigerator", "Dishwasher", "Coffee-Machine", "Vending-Machine", "Ice-Maker", "Air-Purifier", "Paper-Shredder", "Scanner", "Fax-Machine", "other"]
        },
        {
          "name": "power_requirements",
          "label": "Power Requirements",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "service_contract_number",
          "label": "Service Contract Number",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "service_provider",
          "label": "Service Provider",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "service_contract_expiry",
          "label": "Service Contract Expiry",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "supplies_consumables",
          "label": "Supplies/Consumables",
          "type": "textarea",
          "required": true,
          "section": "main"
        },
        {
          "name": "monthly_service_cost",
          "label": "Monthly Service/Lease Cost",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "usage_meter",
          "label": "Copy Count/Usage Meter",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_date",
          "label": "Disposal Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_method",
          "label": "Disposal Method",
          "type": "select",
          "required": false,
          "section": "main",
          "options": ["Sold", "Donated", "Recycled", "Landfill", "Trade-In", "Return-to-Vendor", "E-Waste", "Asset-Liquidation", "Not-Disposed"]
        },
        {
          "name": "disposal_certificate",
          "label": "Disposal Certificate",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "recyclable_materials",
          "label": "Recyclable Materials",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "environmental_certification",
          "label": "Environmental Certification",
          "type": "multiselect",
          "required": false,
          "section": "main",
          "options": ["FSC", "GREENGUARD", "Energy-Star", "EPEAT", "RoHS", "WEEE", "Cradle-to-Cradle", "BIFMA", "No-Certification"]
        },
        {
          "name": "donation_recipient",
          "label": "Donation Recipient",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "resale_value",
          "label": "Resale Value Received",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "disposal_cost",
          "label": "Disposal Cost",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "asset_photos",
          "label": "Asset Photos",
          "type": "file",
          "required": false,
          "section": "main"
        },
        {
          "name": "manual_location",
          "label": "Manual/Documentation Location",
          "type": "text",
          "required": true,
          "section": "main"
        },
        {
          "name": "assembly_diagram_ref",
          "label": "Assembly Diagram Reference",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "record_created_by",
          "label": "Record Created By",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "record_created_date",
          "label": "Record Created Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_updated_by",
          "label": "Last Updated By",
          "type": "text",
          "required": false,
          "section": "main"
        },
        {
          "name": "last_updated_date",
          "label": "Last Updated Date",
          "type": "date",
          "required": false,
          "section": "main"
        },
        {
          "name": "audit_date",
          "label": "Audit/Inventory Date",
          "type": "date",
          "required": true,
          "section": "main"
        },
        {
          "name": "notes",
          "label": "Notes/Comments",
          "type": "textarea",
          "required": false,
          "section": "main"
        },
        {
          "name": "attachments",
          "label": "Attachments",
          "type": "file",
          "required": true,
          "section": "main"
        }
      ]
    }')
  `);
  }

  // ==================== ASSETS TABLE ====================
  await tenantDb.execute(`
    CREATE TABLE IF NOT EXISTS assets (
          id INT PRIMARY KEY AUTO_INCREMENT,
          asset_tag VARCHAR(50) UNIQUE NOT NULL,
          category_id INT NOT NULL,
          name VARCHAR(200) NOT NULL,
          status ENUM( 'New','In Use','In Stock/Spare','In Repair','Retired','Lost/Stolen','Disposed') DEFAULT 'In Use',
          assigned_to_emp_id INT NULL,
          assigned_to_admin_id INT NULL,
          assigned_at TIMESTAMP NULL,
          field_values JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_by INT NULL,
          
          FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE RESTRICT,
          FOREIGN KEY (assigned_to_emp_id) REFERENCES employee_info(id) ON DELETE SET NULL,
          FOREIGN KEY (assigned_to_admin_id) REFERENCES super_admin(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES super_admin(id) ON DELETE SET NULL,
          
          CONSTRAINT check_single_assignment CHECK (
            NOT (assigned_to_emp_id IS NOT NULL AND assigned_to_admin_id IS NOT NULL)
          )
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


