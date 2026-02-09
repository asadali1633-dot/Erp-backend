const db = "";


const createTicket = async (req, res) => {
    try {
        const subadmin_id = req.user.id;
        const {
            contact_name,
            account_name,
            email,
            phone,
            priority,
            subject,
            description,
            status,
            ticket_owner,
        } = req.body;
        const [result] = await db.execute(
            `INSERT INTO tickets 
            (subadmin_id, contact_name, account_name, email, phone, priority, subject, description, status, ticket_owner)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                subadmin_id,
                contact_name,
                account_name,
                email,
                phone,
                priority,
                subject,
                description,
                status,
                ticket_owner,
            ]
        );

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket_id: result.insertId,
        });
    } catch (err) {
        console.error("Create Ticket Error:", err);
        res.status(500).json({ failed: false, message: "Something went wrong" });
    }
};

const GetAllTickets = async (req, res) => {
  try {
    const subadmin_id = req.user.id;
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE subadmin_id = ?";
    let values = [subadmin_id];

    if (search) {
      whereClause +=
        " AND (id = ? OR contact_name LIKE ? OR account_name LIKE ? OR email LIKE ? OR subject LIKE ? OR status LIKE ?)";
      values.push(
        search,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM tickets ${whereClause}`,
      values
    );
    const total = countResult[0].total;

    const [rows] = await db.execute(
      `
      SELECT 
        id,
        contact_name,
        account_name,
        email,
        phone,
        priority,
        subject,
        description,
        status,
        ticket_owner,
        created_at,
        updated_at
      FROM tickets
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...values, Number(limit), Number(offset)]
    );

    return res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      tickets: rows,
    });
  } catch (error) {
    console.error("GetAllTickets Error:", error);
    return res.status(500).json({
      failed: true,
      message: "Something went wrong",
      error,
    });
  }
};


module.exports = {
    createTicket,
    GetAllTickets
}
