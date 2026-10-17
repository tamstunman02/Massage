export const providers = [
  {
    id: 1, name: 'มะลิ', age: 28, province: 'กรุงเทพมหานคร', area: 'สุขุมวิท · วัฒนา',
    gender: 'ผู้หญิง', line: 'mali.relax', price: 1200, rating: '4.98', reviews: 128,
    initials: 'ม', visual: 'visual-sand', category: 'Social companion',
    description: 'ผู้ให้บริการอิสระสำหรับนัดพบและร่วมกิจกรรม พูดคุยรายละเอียดและขอบเขตที่สบายใจกันได้ก่อนนัดหมาย',
    tags: ['พบปะพูดคุย', 'ร่วมกิจกรรม', 'โปรไฟล์ตัวอย่าง'], venue: 'สถานที่นัดพบ · สุขุมวิท 39',
    modes: ['ที่ร้าน', 'นอกสถานที่'],
  },
  {
    id: 2, name: 'นนท์', age: 31, province: 'เชียงใหม่', area: 'นิมมาน · เมืองเชียงใหม่',
    gender: 'ผู้ชาย', line: 'nonthetherapist', price: 1000, rating: '5.00', reviews: 96,
    initials: 'น', visual: 'visual-olive', category: 'Local companion',
    description: 'รับนัดพบและร่วมกิจกรรมในพื้นที่เชียงใหม่ แจ้งรายละเอียด ราคา และขอบเขตบริการให้ชัดเจนก่อนยืนยัน',
    tags: ['ร่วมกิจกรรม', 'พบปะพูดคุย', 'โปรไฟล์ตัวอย่าง'], venue: 'สถานที่นัดพบ · นิมมาน',
    modes: ['ที่ร้าน', 'นอกสถานที่'],
  },
  {
    id: 3, name: 'เรน', age: 26, province: 'ภูเก็ต', area: 'ป่าตอง · กะทู้',
    gender: 'LGBTQ+', line: 'rain.sabai', price: 1400, rating: '4.96', reviews: 74,
    initials: 'ร', visual: 'visual-lilac', category: 'Inclusive companion',
    description: 'ผู้ให้บริการอิสระที่ต้อนรับทุกอัตลักษณ์ นัดพบและร่วมกิจกรรมได้โดยเคารพความยินยอมและขอบเขตของกันและกัน',
    tags: ['พบปะพูดคุย', 'Inclusive', 'โปรไฟล์ตัวอย่าง'], venue: 'สถานที่นัดพบ · ป่าตอง',
    modes: ['ที่ร้าน', 'นอกสถานที่'],
  },
  {
    id: 4, name: 'แพรว', age: 30, province: 'ชลบุรี', area: 'บางแสน · เมืองชลบุรี',
    gender: 'ผู้หญิง', line: 'praew.events', price: 950, rating: '4.95', reviews: 52,
    initials: 'พ', visual: 'visual-clay', category: 'Event companion',
    description: 'รับงานอิสระสำหรับงานสังคมและกิจกรรมในชลบุรี นัดหมายล่วงหน้า พร้อมตกลงเวลาและรายละเอียดให้ตรงกัน',
    tags: ['งานอีเวนต์', 'ร่วมกิจกรรม', 'โปรไฟล์ตัวอย่าง'], venue: 'สถานที่นัดพบ · บางแสน',
    modes: ['ที่ร้าน', 'นอกสถานที่'],
  },
  {
    id: 5, name: 'คิม', age: 29, province: 'กรุงเทพมหานคร', area: 'อารีย์ · พญาไท',
    gender: 'LGBTQ+', line: 'kim.kindtouch', price: 1250, rating: '4.97', reviews: 83,
    initials: 'ค', visual: 'visual-moss', category: 'Personal companion',
    description: 'ผู้ให้บริการส่วนตัวสำหรับนัดพบและกิจกรรมไลฟ์สไตล์ เลือกรูปแบบที่สะดวกและพูดคุยข้อตกลงก่อนนัดได้',
    tags: ['ไลฟ์สไตล์', 'พบปะพูดคุย', 'โปรไฟล์ตัวอย่าง'], venue: 'สถานที่นัดพบ · อารีย์',
    modes: ['ที่ร้าน', 'นอกสถานที่'],
  },
  {
    id: 6, name: 'ฟ้า', age: 27, province: 'ขอนแก่น', area: 'ในเมือง · ขอนแก่น',
    gender: 'ผู้หญิง', line: 'fah.connect', price: 850, rating: '4.91', reviews: 41,
    initials: 'ฟ', visual: 'visual-honey', category: 'Lifestyle companion',
    description: 'รับนัดพบและร่วมกิจกรรมในขอนแก่น เป็นกันเอง สื่อสารตรงไปตรงมา และเคารพความเป็นส่วนตัว',
    tags: ['ไลฟ์สไตล์', 'ร่วมกิจกรรม', 'โปรไฟล์ตัวอย่าง'], venue: 'สถานที่นัดพบ · ในเมือง',
    modes: ['ที่ร้าน'],
  },
]

export const provinces = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
  'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย',
  'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี',
  'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี',
  'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร',
  'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน',
  'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
  'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี',
  'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ',
  'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี',
]

const demoNames = [
  'แพร', 'มิน', 'ฟ้า', 'ใบเฟิร์น', 'พิม', 'เมย์', 'น้ำ', 'อิง', 'พลอย', 'มุก',
  'นนท์', 'คิม', 'เจ', 'เรน', 'นัท', 'วิน', 'ข้าวหอม', 'ออม', 'ต้น', 'ปัน',
  'ดาว', 'เจน', 'พีช', 'กานต์', 'ริว', 'โบนัส', 'โฟกัส', 'ไอซ์', 'ภู', 'มีนา',
]
const demoServices = [
  ['พบปะพูดคุย', 'ร่วมกิจกรรม', 'โปรไฟล์ตัวอย่าง'],
  ['ร่วมกิจกรรม', 'ไลฟ์สไตล์', 'โปรไฟล์ตัวอย่าง'],
  ['งานอีเวนต์', 'พบปะพูดคุย', 'โปรไฟล์ตัวอย่าง'],
]

export const provinceDemoProviders = provinces.flatMap((province, provinceIndex) =>
  Array.from({ length: 3 }, (_, slot) => {
    const id = 10000 + provinceIndex * 3 + slot
    const name = demoNames[(provinceIndex * 3 + slot) % demoNames.length]
    const price = 800 + ((provinceIndex * 3 + slot) % 13) * 100
    return {
      id,
      name,
      age: 22 + ((provinceIndex + slot) % 13),
      province,
      area: `ในเมือง · ${province}`,
      gender: ['ผู้หญิง', 'ผู้ชาย', 'LGBTQ+'][slot],
      line: `demo.${provinceIndex + 1}.${slot + 1}`,
      price,
      rating: 'ใหม่',
      reviews: 0,
      initials: name.slice(0, 1),
      visual: ['visual-sand', 'visual-olive', 'visual-lilac', 'visual-clay', 'visual-moss', 'visual-honey'][(provinceIndex + slot) % 6],
      category: 'โปรไฟล์ตัวอย่าง · 18+',
      description: `โปรไฟล์สมมติสำหรับทดลองใช้งานใน${province} ไม่ใช่ผู้ให้บริการจริง · ผู้ใหญ่ 18+`,
      tags: demoServices[slot],
      venue: `สถานที่นัดพบ · ${province}`,
      modes: ['ที่ร้าน', 'นอกสถานที่'],
    }
  }),
)

export const bookings = [
  {
    id: 'ND-260918', providerId: 2, service: 'ร่วมกิจกรรม · 90 นาที',
    date: '2026-10-22', time: '15:00', mode: 'ที่ร้าน', venue: 'สถานที่นัดพบ · นิมมาน',
    amount: 1500, status: 'ยืนยันแล้ว',
  },
  {
    id: 'ND-260774', providerId: 1, service: 'พบปะพูดคุย · 60 นาที',
    date: '2026-10-11', time: '19:00', mode: 'นอกสถานที่', venue: 'สุขุมวิท 24',
    amount: 1500, status: 'เสร็จสิ้น',
  },
]

// Demo accounts; passwords are hashed before being stored.
export const users = [
  { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { name: 'มะลิ', email: 'mali@example.com', password: 'seller123', role: 'seller', providerId: 1 },
  { name: 'สมชาย', email: 'somchai@example.com', password: 'buyer123', role: 'buyer' },
]
