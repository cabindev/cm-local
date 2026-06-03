'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'

export default function ConsentModal({ onConfirm }: { onConfirm: () => void }) {
  const [general, setGeneral] = useState(true)
  const [sensitive, setSensitive] = useState(true)
  const ready = general && sensitive

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-yellow-400 text-gray-900 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg">แจ้งสิทธิ์ตาม PDPA</h2>
              <p className="text-xs text-gray-700 mt-0.5">กรุณาอ่านและยืนยันก่อนบันทึกข้อมูล</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-1">วัตถุประสงค์การเก็บข้อมูล</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              ระบบนี้เก็บข้อมูลส่วนบุคคลเพื่อ<strong>ติดตามและประเมินผล</strong>โครงการชุมชนสุขภาวะ (กพร.)
              ครอบคลุมระยะ 3 ปี โดยไม่นำไปใช้เพื่อวัตถุประสงค์อื่น
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-1.5">ข้อมูลที่เก็บรวบรวม</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                ชื่อ-นามสกุล และเพศ
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5 flex-shrink-0">•</span>
                <span>
                  <strong className="text-orange-700">ข้อมูลสุขภาพ (ข้อมูลอ่อนไหว)</strong> — พฤติกรรมการดื่มเครื่องดื่มแอลกอฮอล์
                  การสูบบุหรี่ และการดื่มแล้วขับ
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                สถานะการเปลี่ยนแปลงพฤติกรรมและผลลัพธ์รายปี
              </li>
            </ul>
          </section>

          <section className="bg-gray-50 rounded-xl p-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400 font-medium mb-0.5">ระยะเวลาเก็บข้อมูล</p>
                <p className="text-gray-700">ตลอดระยะโครงการ (3 ปี) และไม่เกิน 5 ปีหลังสิ้นสุดโครงการ</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium mb-0.5">ผู้ควบคุมข้อมูล</p>
                <p className="text-xs font-light text-gray-600">เครือข่ายองค์กรงดเหล้า (สคล)<br />ภาคประชาสังคม</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-1">สิทธิ์ของเจ้าของข้อมูล</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              เจ้าของข้อมูลมีสิทธิ์ขอดู แก้ไข ลบ หรือถอนความยินยอมได้ทุกเมื่อ
              โดยแจ้งต่อเจ้าหน้าที่โครงการในชุมชน
            </p>
          </section>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={general}
                onChange={(e) => setGeneral(e.target.checked)}
                className="accent-yellow-500 w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                ข้าพเจ้าได้<strong>แจ้งวัตถุประสงค์</strong>การเก็บข้อมูลแก่เจ้าของข้อมูลแล้ว
                และเจ้าของข้อมูลรับทราบแล้ว
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sensitive}
                onChange={(e) => setSensitive(e.target.checked)}
                className="accent-yellow-500 w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                เจ้าของข้อมูล<strong>ยินยอมโดยชัดแจ้ง</strong>ให้เก็บ ใช้ และเปิดเผย
                <span className="text-orange-700 font-semibold"> ข้อมูลสุขภาพ </span>
                เพื่อวัตถุประสงค์โครงการสุขภาวะ
              </span>
            </label>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            disabled={!ready}
            onClick={onConfirm}
            className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl transition-colors text-sm"
          >
            {ready ? 'ยืนยันความยินยอม — ดำเนินการต่อ' : 'กรุณาติ๊กยืนยันทั้ง 2 ข้อ'}
          </button>
        </div>
      </div>
    </div>
  )
}
