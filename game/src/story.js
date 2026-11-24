export const story = {
  protagonist: 'Nadia',
  antagonist: 'Sindikat Garis Hitam',
  summary: 'Kurir malam Nadia tanpa sengaja membawa paket untuk Garis Hitam. Bersama Mira dan saksi bernama Raka, ia menelusuri jaringan pemerasan sindikat dan mempertaruhkan keselamatan demi membuka kedok mereka kepada seluruh kota.',
  missions: [
    {
      title: 'Paket Terakhir',
      dialogue: [
        { speaker: 'Nadia', text: 'Satu pengantaran lagi. Setelah ini aku berhenti.' },
        { speaker: 'Mira', text: 'Antar paket tertutup ke warung Bu Sari di Pantai Kerang. Jangan buka di jalan.' },
        { speaker: 'Nadia', text: 'Ada lambang Garis Hitam di segelnya. Ini bukan kiriman biasa.' },
      ],
    },
    {
      title: 'Jejak di Dermaga',
      dialogue: [
        { speaker: 'Nadia', text: 'Lambang di peti gudang sama persis dengan segel paket.' },
        { speaker: 'Mira', text: 'Mereka memakai dermaga untuk memindahkan sesuatu. Periksa peti itu.' },
        { speaker: 'Nadia', text: 'Catatan pengiriman ini menyebut nama seorang saksi.' },
      ],
    },
    {
      title: 'Saksi Jalan Layang',
      dialogue: [
        { speaker: 'Nadia', text: 'Raka, apa yang kamu lihat di pelabuhan?' },
        { speaker: 'Raka', text: 'Garis Hitam memeras pedagang. Mereka memindahkan buku catatan ke menara.' },
        { speaker: 'Nadia', text: 'Kalau buku itu ditemukan, kota ini bisa melawan mereka.' },
      ],
    },
    {
      title: 'Ekornya Panjang',
      dialogue: [
        { speaker: 'Mira', text: 'Kurir mereka bergerak ke Bukit Salju. Ikuti tanpa menarik perhatian.' },
        { speaker: 'Nadia', text: 'Aku tetap di belakang. Mereka akan membawaku ke bukunya.' },
        { speaker: 'Mira', text: 'Hati-hati, Nadia. Mereka tahu Raka sudah bicara.' },
      ],
    },
    {
      title: 'Bukti di Menara',
      dialogue: [
        { speaker: 'Nadia', text: 'Ini daftar pembayaran dan nama pedagang yang mereka ancam.' },
        { speaker: 'Mira', text: 'Buat salinan. Bukti ini harus sampai ke telinga seluruh kota.' },
        { speaker: 'Nadia', text: 'Aku tahu tempat yang masih berani menyiarkan kebenaran.' },
      ],
    },
    {
      title: 'Siaran Senja',
      dialogue: [
        { speaker: 'Nadia', text: 'Buku Garis Hitam ada di tanganku. Warga Pulau Senja, dengarkan.' },
        { speaker: 'Mira', text: 'Siarannya sudah mengudara. Para pedagang mulai bersaksi.' },
        { speaker: 'Nadia', text: 'Malam ini kita berhenti bersembunyi. Kota ini milik warganya.' },
      ],
    },
  ],
};

export function getDialogue(missionIndex) {
  return story.missions[missionIndex]?.dialogue ?? [];
}

export function getMissionTitle(missionIndex) {
  return story.missions[missionIndex]?.title ?? 'Cerita selesai';
}
