const calculateSzallitasKoltseg = (tavolsag, mennyiseg) => {
  if (!tavolsag || !mennyiseg) return 0;
  if (tavolsag <= 10) {
    return 4000 * mennyiseg;
  } else {
    const extraDistance = tavolsag - 10;
    const extraBlocks = Math.ceil(extraDistance / 5);
    return (4000 * mennyiseg) + (extraBlocks * 700 * mennyiseg);
  }
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (jelszo) => {
  return jelszo && jelszo.length >= 6;
};

const calculateAr = (betonAr, mennyiseg, pumpaSzukseges, betonszalAr, tavolsag) => {
  const quantity = parseFloat(mennyiseg) || 0;
  const betonKoltseg = (parseFloat(betonAr) || 0) * quantity;
  const pumpaKoltseg = pumpaSzukseges ? 50000 : 0;
  const betonszalKoltseg = parseFloat(betonszalAr) || 0;
  const szallitasKoltseg = calculateSzallitasKoltseg(tavolsag || 0, quantity);
  const nettoOsszeg = betonKoltseg + pumpaKoltseg + betonszalKoltseg + szallitasKoltseg;
  const afaOsszeg = Math.round(nettoOsszeg * 0.27);
  const bruttoOsszeg = nettoOsszeg + afaOsszeg;
  
  return { 
    betonKoltseg, 
    pumpaKoltseg, 
    betonszalKoltseg, 
    szallitasKoltseg, 
    nettoOsszeg, 
    afaOsszeg, 
    bruttoOsszeg 
  };
};

module.exports = {
  calculateSzallitasKoltseg,
  validateEmail,
  validatePassword,
  calculateAr
};