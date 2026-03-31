import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout title="Betonlogisztika" description="Professzionális betonszállítás webalkalmazás">
      
      {/* Címsor - világoskék dizájnos keret */}
      <div style={{
        padding: '50px 20px 40px',
        textAlign: 'center',
        borderBottom: '1px solid #3e3e42',
        background: 'linear-gradient(135deg, #1e2a3a 0%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(79,195,247,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(79,195,247,0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/img/logoo.png" alt="Betonlogisztika" style={{ width: '150px', marginBottom: '15px' }} />
          <h1 style={{ fontSize: '32px', color: '#fff', marginBottom: '8px' }}>Betonlogisztika</h1>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>Premontrei Szakgimnázium és Technikum | Keszthely | 2026</p>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>Szoftvertesztelő és fejlesztő | 5-0613-12-03</p>
          <div style={{
            display: 'inline-block',
            marginTop: '12px',
            padding: '4px 16px',
            background: 'rgba(79,195,247,0.2)',
            borderRadius: '20px',
            border: '1px solid rgba(79,195,247,0.5)'
          }}>
            <p style={{ fontSize: '14px', color: '#4fc3f7', margin: 0, fontWeight: '500' }}>Készítette: Erdősi Zsombor | Fáró Sebestyén</p>
          </div>
        </div>
      </div>

      {/* Bemutatkozás */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '20px', borderLeft: '3px solid #4fc3f7', paddingLeft: '12px' }}>📌 Bemutatkozás</h2>
        <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px' }}>
          <p style={{ color: '#ddd', lineHeight: '1.7', marginBottom: '15px' }}>A projekt munkát ketten hoztuk létre: <strong style={{ color: '#4fc3f7' }}>Erdősi Zsombor</strong> és <strong style={{ color: '#4fc3f7' }}>Fáró Sebestyén</strong>. A projektünk neve: <strong style={{ color: '#fff' }}>Betonlogisztika</strong>.</p>
          <p style={{ color: '#ddd', lineHeight: '1.7', marginBottom: '15px' }}>A téma kiválasztása mellett azért döntöttünk, mert szeretnénk segítséget nyújtani csapatunk hozzátartozóinak, valamint más érdeklődőknek is. Úgy gondoljuk, hogy a webes alkalmazásunk jelentős idő-, pénz- és energiamegtakarítást tesz lehetővé. A felhasználók tartózkodási helytől függetlenül választhatnak különböző betongyártó cégek közül, és kiválaszthatják a számukra legmegfelelőbb megoldást. Különösen fontosnak tartottuk, hogy a sok telefonálgatás helyett egy gyorsabb és átláthatóbb módon lehessen ezeket a folyamatokat elvégezni.</p>
          <p style={{ color: '#ddd', lineHeight: '1.7', marginBottom: '15px' }}>A témaválasztás során szempont volt az is, hogy egy olyan projektet hozzunk létre, amely a vizsga után is hasznos marad, illetve későbbiek folyamán a családi vállalkozásba is be tudjuk építeni. Nem találtunk olyan weboldalt, ahol ezek a folyamatok teljes mértékben online zajlanának, ezért célunk volt, hogy ezt elsőként valósítsuk meg.</p>
          <p style={{ color: '#ddd', lineHeight: '1.7' }}>Összességében a Betonlogisztika projekt szoros kapcsolatban áll más betongyártó cégekkel, ezáltal a Dunántúl egész területén lehetőséget biztosít a betonszállítás megszervezésére.</p>
        </div>
      </div>

      {/* Együttműködés */}
      <div style={{ background: '#252526', padding: '50px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '20px', borderLeft: '3px solid #4fc3f7', paddingLeft: '12px' }}>🤝 Együttműködés</h2>
          <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px' }}>
            <p style={{ color: '#ddd', lineHeight: '1.7', marginBottom: '15px' }}>A projekt megvalósítása során végig gördülékenyen és hatékonyan tudtunk együtt dolgozni, ami nagyban hozzájárult a közös sikerünkhöz. A feladatokat egyenlő arányban osztottuk fel egymás között, így mindketten aktívan részt vettünk a fejlesztés minden szakaszában. A munka során folyamatosan támogattuk egymást. Különösen hasznosnak bizonyult, hogy egymás tudását és tapasztalatait kamatoztatni tudtuk, ennek köszönhetően mindketten számos új ismeretre tettünk szert. Az együttműködés nemcsak hatékony, hanem motiváló is volt, ami jelentősen hozzájárult a projekt sikeres megvalósításához.</p>
            <p style={{ color: '#ddd', lineHeight: '1.7' }}>A projekt során jelentősen fejlődtek kommunikációs készségeink is. Rájöttünk arra, mennyire fontos az őszinte kommunikáció, valamint a másik fél véleményének meghallgatása és figyelembevétele. Az együttműködés során megtanultuk, hogyan lehet hatékonyan megbeszélni az eltérő nézőpontokat, és közös döntéseket hozni a projekt előrehaladása érdekében. Ez a tapasztalat nemcsak a projekt sikeréhez járult hozzá, hanem a jövőbeli közös munkák során is hasznos lesz számunkra.</p>
          </div>
        </div>
      </div>

      {/* Tervezés */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '50px 20px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '20px', borderLeft: '3px solid #4fc3f7', paddingLeft: '12px' }}>📅 Tervezés</h2>
        <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px' }}>
          <p style={{ color: '#ddd', lineHeight: '1.7' }}>A határidők betartása kulcsfontosságú volt a projekt sikerében. Már a munka elején pontosan meghatároztuk, ki melyik feladatért felel, és mikorra kell azokat teljesítenie. Projektünk elején létrehoztunk egy Gantt Diagrammot, amit folyamatosan próbáltunk betartani. Ennek köszönhetően elkerültük a stresszes helyzeteket, a munka pedig kiegyensúlyozott ütemben haladhatott. Ez a tudatos tervezés lehetővé tette, hogy minden feladattal időben végezzünk, és a projekt gördülékenyen valósuljon meg.</p>
        </div>
      </div>

      {/* Technológiák */}
      <div style={{ background: '#252526', padding: '50px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '20px', borderLeft: '3px solid #4fc3f7', paddingLeft: '12px' }}>⚙️ Technológiák</h2>
          <div style={{ background: '#1e1e1e', padding: '30px', borderRadius: '12px' }}>
            <p style={{ color: '#ddd', lineHeight: '1.7', marginBottom: '15px' }}>A modern technológia, különösen a felhőalapú szolgáltatások, jelentősen megkönnyítette és hatékonyabbá tette a projektmunkánkat. Bárhonnan hozzáférhettünk a folyamatban lévő feladatokhoz, így a helyszín nem korlátozta a munkavégzést. Az automatikus mentések biztosították, hogy mindig a legfrissebb verzióval dolgozzunk, miközben adataink biztonságban maradtak. Ez a technológiai háttér átláthatóbbá, szervezettebbé és gördülékenyebbé tette a munkafolyamatot és lehetővé tette, hogy a csapatunk koncentráltan végezze a feladatokat.</p>
            <p style={{ color: '#ddd', lineHeight: '1.7' }}>A közös munka során nem csak a szakmai ismerettségeinket fejlesztettük, hanem még szorosabb barátságot és támogató légkört is alkottunk. Ez által is precízebb és sikeresebb munkát tudtunk végezni.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}