import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const seedPassword = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  const testAccounts = [
    {
      email: 'owner1@pollipop.local',
      name: 'Instructor A (Owner 1)',
      role: 'OWNER',
      department: 'CPE',
    },
    {
      email: 'owner2@pollipop.local',
      name: 'Instructor B (Owner 2)',
      role: 'OWNER',
      department: 'ENV',
    },
    {
      email: 'student1@pollipop.local',
      name: 'Student 1 (Respondent A)',
      role: 'RESPONDENT',
      department: 'CPE',
    },
    {
      email: 'student2@pollipop.local',
      name: 'Student 2 (Respondent B)',
      role: 'RESPONDENT',
      department: 'ENV',
    },
  ];

  console.log('Starting idempotent database seeding...');

  for (const account of testAccounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        role: account.role,
        department: account.department,
        passwordHash,
        isActive: true,
      },
      create: {
        email: account.email,
        name: account.name,
        role: account.role,
        department: account.department,
        passwordHash,
        isActive: true,
      },
    });
    console.log(`Seeded user: ${user.email} (${user.role})`);
  }

  // Seed 4 realistic university surveys for owner1 (if not already present)
  const owner1 = await prisma.user.findUnique({
    where: { email: 'owner1@pollipop.local' },
  });

  if (owner1) {
    const sampleSurveys = [
      {
        title: 'ความพึงพอใจต่อการใช้บริการห้องสมุดมหาวิทยาลัย',
        description: 'เพื่อรวบรวมความคิดเห็นของนักศึกษาสำหรับปรับปรุงพื้นที่ ทรัพยากรสารสนเทศ และบริการห้องสมุดให้ตอบโจทย์การเรียนรู้',
        mode: 'IDENTIFIED',
        status: 'PUBLISHED',
        questions: [
          {
            text: 'คุณใช้บริการห้องสมุดบ่อยเพียงใด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'ทุกวัน (5-7 วันต่อสัปดาห์)',
              '2-4 วันต่อสัปดาห์',
              'สัปดาห์ละ 1 ครั้ง',
              'นานๆ ครั้ง (เฉพาะช่วงสอบ)',
              'ไม่เคยใช้บริการ',
            ],
          },
          {
            text: 'ความพึงพอใจต่อจำนวนที่นั่งอ่านหนังสือและโต๊ะทำงาน (1 = น้อยที่สุด/ควรปรับปรุงเร่งด่วน, 5 = มากที่สุด/เพียงพอดีเยี่ยม)',
            type: 'RATING',
            required: true,
            orderIndex: 1,
            options: [],
          },
          {
            text: 'ความเงียบสงบและบรรยากาศที่เอื้อต่อการอ่านหนังสือ (1 = มีเสียงรบกวนบ่อยมาก, 5 = เงียบสงบเป็นระเบียบดีเยี่ยม)',
            type: 'RATING',
            required: true,
            orderIndex: 2,
            options: [],
          },
          {
            text: 'เวลาเปิด-ปิดห้องสมุดในปัจจุบันเหมาะสมกับการใช้งานของคุณเพียงใด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 3,
            options: [
              'เหมาะสมมากกับวิถีชีวิตนักศึกษา',
              'เหมาะสมปานกลาง',
              'อยากให้เปิดเช้าขึ้น (ก่อน 08:00 น.)',
              'อยากให้ขยายเวลาปิดช่วงสอบ (เปิดบริการ 24 ชั่วโมง)',
              'ไม่เกี่ยวข้อง',
            ],
          },
          {
            text: 'ความสะดวกรวดเร็วในการค้นหาและบริการยืม-คืนหนังสือ/สื่อการเรียนรู้ (1 = ค้นหายาก/ระบบช้า, 5 = สะดวก รวดเร็ว ทันสมัยมาก)',
            type: 'RATING',
            required: true,
            orderIndex: 4,
            options: [],
          },
          {
            text: 'คุณต้องการให้ห้องสมุดพัฒนาหรือปรับปรุงด้านใดมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 5,
            options: [
              'เพิ่มจำนวนปลั๊กไฟและจุดชาร์จอุปกรณ์',
              'เพิ่มห้องศึกษาค้นคว้ากลุ่ม (Group Study)',
              'ปรับปรุงความเร็วและความเสถียรของ Wi-Fi',
              'เพิ่มจำนวนหนังสือ วารสาร และฐานข้อมูลงานวิจัย',
              'ปรับปรุงระบบปรับอากาศและแสงสว่าง',
            ],
          },
        ],
      },
      {
        title: 'ความคิดเห็นต่อโรงอาหารและบริการอาหารในมหาวิทยาลัย',
        description: 'เพื่อสำรวจประสบการณ์การใช้บริการโรงอาหาร คุณภาพ ราคา ความสะอาด และความหลากหลายของร้านค้าในมหาวิทยาลัย',
        mode: 'ANONYMOUS',
        status: 'PUBLISHED',
        questions: [
          {
            text: 'คุณใช้บริการโรงอาหารของมหาวิทยาลัยกี่วันต่อสัปดาห์?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'เกือบทุกวัน (4-5 วันต่อสัปดาห์)',
              '2-3 วันต่อสัปดาห์',
              '1 วันต่อสัปดาห์',
              'นานๆ ครั้ง',
              'ไม่เคยใช้บริการ',
            ],
          },
          {
            text: 'โดยทั่วไปคุณใช้จ่ายค่าอาหารและเครื่องดื่มเฉลี่ยต่อมื้อเท่าไร?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 1,
            options: [
              'ต่ำกว่า 40 บาท',
              '40 - 55 บาท',
              '56 - 70 บาท',
              'มากกว่า 70 บาท',
            ],
          },
          {
            text: 'ความพึงพอใจต่อความหลากหลายของเมนูอาหาร (อาหารจานเดียว ข้าวแกง ก๋วยเตี๋ยว ฮาลาล และมังสวิรัติ) (1 = น้อยที่สุด/ตัวเลือกจำกัด, 5 = มากที่สุด/หลากหลายดีเยี่ยม)',
            type: 'RATING',
            required: true,
            orderIndex: 2,
            options: [],
          },
          {
            text: 'ความพึงพอใจต่อความสะอาดของพื้นที่รับประทานอาหาร ภาชนะ และจุดทิ้งขยะ (1 = ควรปรับปรุงเร่งด่วน, 5 = สะอาดเรียบร้อยดีเยี่ยม)',
            type: 'RATING',
            required: true,
            orderIndex: 3,
            options: [],
          },
          {
            text: 'ความคุ้มค่าของปริมาณและคุณภาพอาหารเมื่อเทียบกับราคา (1 = ไม่คุ้มค่า/แพงเกินไป, 5 = คุ้มค่าและเหมาะสมมาก)',
            type: 'RATING',
            required: true,
            orderIndex: 4,
            options: [],
          },
          {
            text: 'ปัญหาที่คุณพบบ่อยที่สุดในช่วงเวลาเร่งด่วน (11:30 - 13:00 น.) คืออะไร?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 5,
            options: [
              'ที่นั่งรับประทานอาหารไม่เพียงพอ',
              'คิวรอซื้ออาหารนานเกิน 15 นาที',
              'สภาพอากาศร้อนอบอ้าวและการระบายอากาศไม่ดี',
              'จุดล้างมือ กระดาษชำระ หรือน้ำดื่มไม่เพียงพอ',
              'ไม่พบปัญหา',
            ],
          },
        ],
      },
      {
        title: 'ประสบการณ์การใช้งานเครือข่าย Wi-Fi ภายในมหาวิทยาลัย',
        description: 'เพื่อสำรวจคุณภาพ ความครอบคลุม และเสถียรภาพของเครือข่ายอินเทอร์เน็ตไร้สายสำหรับนักศึกษาในทุกพื้นที่',
        mode: 'IDENTIFIED',
        status: 'PUBLISHED',
        questions: [
          {
            text: 'คุณใช้งาน Wi-Fi ของมหาวิทยาลัยบ่อยเพียงใด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'ตลอดเวลาที่อยู่ในมหาวิทยาลัย',
              'เฉพาะเวลาเรียนในห้องเรียน',
              'เฉพาะเมื่อทำงานกลุ่มหรืออ่านหนังสือ',
              'แทบไม่ได้ใช้ (ใช้สัญญาณมือถือส่วนตัว)',
            ],
          },
          {
            text: 'คุณใช้งาน Wi-Fi ในพื้นที่ใดของมหาวิทยาลัยเป็นประจำมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 1,
            options: [
              'อาคารเรียนรวมและห้องบรรยาย',
              'หอพักนักศึกษาภายในมหาวิทยาลัย',
              'ห้องสมุดและศูนย์การเรียนรู้',
              'โรงอาหาร ลานกิจกรรม และสนามกีฬา',
            ],
          },
          {
            text: 'ความเสถียรของสัญญาณ (ไม่พบปัญหาการหลุดหรือเชื่อมต่อไม่ติด) (1 = สัญญาณหลุดบ่อยมาก, 5 = เสถียรต่อเนื่องดีเยี่ยม)',
            type: 'RATING',
            required: true,
            orderIndex: 2,
            options: [],
          },
          {
            text: 'ความเร็วในการดาวน์โหลดและอัปโหลดสำหรับการเรียนและการค้นคว้า (1 = ช้ามาก/โหลดไม่ขึ้น, 5 = รวดเร็วทันใจมาก)',
            type: 'RATING',
            required: true,
            orderIndex: 3,
            options: [],
          },
          {
            text: 'ความสะดวกในขั้นตอนการ Login เข้าสู่ระบบเครือข่ายมหาวิทยาลัย',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 4,
            options: [
              'สะดวกมาก (เชื่อมต่ออัตโนมัติ)',
              'พอใช้ (ต้องยืนยันตัวตนใหม่เป็นบางครั้ง)',
              'ยุ่งยาก (หลุดบ่อยและต้อง Login ใหม่ตลอด)',
              'ไม่เคยใช้งาน',
            ],
          },
          {
            text: 'พื้นที่ใดที่คุณต้องการให้ฝ่ายไอทีปรับปรุงและเพิ่มจุดกระจายสัญญาณด่วนที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 5,
            options: [
              'ห้องเรียนรวมและห้องปฏิบัติการคอมพิวเตอร์',
              'โรงอาหารและพื้นที่นั่งพักผ่อนใต้ตึก',
              'ลานกิจกรรมกลางแจ้งและป้ายรถรับส่ง',
              'พื้นที่โซนหอพักนักศึกษา',
            ],
          },
        ],
      },
      {
        title: 'ความสนใจในการเข้าร่วมกิจกรรมนักศึกษาและชีวิตในรั้วมหาวิทยาลัย',
        description: 'เพื่อรวบรวมความต้องการและความสนใจของนักศึกษา สำหรับวางแผนจัดกิจกรรมเสริมทักษะและสร้างความสัมพันธ์',
        mode: 'ANONYMOUS',
        status: 'PUBLISHED',
        questions: [
          {
            text: 'คุณสนใจเข้าร่วมกิจกรรมนักศึกษาประเภทใดมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 0,
            options: [
              'อบรมทักษะวิชาชีพและเทคโนโลยีใหม่',
              'กีฬา นันทนาการ และ E-Sports',
              'ค่ายอาสาพัฒนาและบำเพ็ญประโยชน์เพื่อสังคม',
              'เทศกาลดนตรี ศิลปวัฒนธรรม และการแสดง',
              'ประกวดแข่งขันนวัตกรรมและแผนธุรกิจ Startup',
            ],
          },
          {
            text: 'ช่วงเวลาใดที่คุณสะดวกเข้าร่วมกิจกรรมมากที่สุด?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 1,
            options: [
              'วันธรรมดาช่วงเย็นหลังเลิกเรียน (หลัง 16:30 น.)',
              'วันเสาร์ช่วงกลางวัน',
              'วันอาทิตย์',
              'ช่วงปิดภาคเรียนหรือวันหยุดยาว',
            ],
          },
          {
            text: 'คุณรับทราบข่าวสารกิจกรรมของมหาวิทยาลัยผ่านช่องทางใดเป็นหลัก?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 2,
            options: [
              'Facebook Page คณะ / องค์การนักศึกษา',
              'Instagram / TikTok สโมสรนักศึกษา',
              'LINE Official Account / OpenChat',
              'ป้ายประกาศและจอดิจิทัลในมหาวิทยาลัย',
              'เพื่อนและรุ่นพี่บอกต่อ',
            ],
          },
          {
            text: 'ความน่าสนใจและความทันสมัยของหัวข้อกิจกรรมที่ผ่านมา (1 = รูปแบบเดิมซ้ำซาก/ไม่น่าสนใจ, 5 = สร้างสรรค์ ทันสมัย และน่าสนใจมาก)',
            type: 'RATING',
            required: true,
            orderIndex: 3,
            options: [],
          },
          {
            text: 'ปัจจัยสำคัญที่สุดที่มีผลต่อการตัดสินใจเข้าร่วมกิจกรรมของคุณคืออะไร?',
            type: 'SINGLE_CHOICE',
            required: true,
            orderIndex: 4,
            options: [
              'ความรู้และทักษะที่นำไปต่อยอดได้จริง',
              'จำนวนชั่วโมงกิจกรรมสะสม (Activity Transcript)',
              'การได้พบปะเพื่อนใหม่และสร้างเครือข่าย',
              'วิทยากรและของที่ระลึก',
              'กิจกรรมตรงกับความสนใจส่วนตัว',
            ],
          },
          {
            text: 'ความสะดวกรวดเร็วในการลงทะเบียนและบันทึกชั่วโมงกิจกรรม (1 = ยุ่งยาก/ตรวจสอบยาก, 5 = สะดวก รวดเร็ว บันทึกผลแม่นยำ)',
            type: 'RATING',
            required: true,
            orderIndex: 5,
            options: [],
          },
        ],
      },
    ];

    for (const surveyData of sampleSurveys) {
      const existing = await prisma.survey.findFirst({
        where: {
          ownerId: owner1.id,
          title: surveyData.title,
        },
      });

      if (!existing) {
        await prisma.survey.create({
          data: {
            ownerId: owner1.id,
            title: surveyData.title,
            description: surveyData.description,
            mode: surveyData.mode,
            status: surveyData.status,
            publishedAt: new Date(),
            questions: {
              create: surveyData.questions.map((q) => ({
                text: q.text,
                type: q.type,
                required: q.required,
                orderIndex: q.orderIndex,
                options: {
                  create: q.options.map((opt, optIdx) => ({
                    text: opt,
                    orderIndex: optIdx,
                  })),
                },
              })),
            },
          },
        });
        console.log(`Seeded university survey: ${surveyData.title}`);
      }
    }
  }

  console.log('Seeding completed successfully.');
}

if (process.env.NODE_ENV !== 'test') {
  seedDatabase()
    .catch((e) => {
      console.error('Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
