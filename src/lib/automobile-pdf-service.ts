import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { RentalContract, SaleContract, Vehicle, Client } from '../types/automobile';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Utilitaire de formatage pour éviter les bugs d'affichage jsPDF
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const generateRentalContractPDF = (contract: RentalContract, vehicle: Vehicle, client: Client) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Bleu
  doc.text('CONTRAT DE LOCATION DE VÉHICULE', 105, 20, { align: 'center' });
  
  doc.setDrawColor(59, 130, 246);
  doc.line(20, 25, 190, 25);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  // Informations du contrat
  doc.text(`Contrat N°: ${contract.contractNumber}`, 20, 40);
  doc.text(`Date de création: ${format(new Date(contract.createdDate), 'dd MMMM yyyy', { locale: fr })}`, 20, 50);

  // Informations du véhicule
  doc.setFont(undefined, 'bold');
  doc.text('VÉHICULE LOUÉ:', 20, 70);
  doc.setFont(undefined, 'normal');
  doc.text(`${vehicle.brand} ${vehicle.model}`, 20, 80);
  doc.text(`Immatriculation: ${vehicle.registration}`, 20, 85);
  doc.text(`Année: ${vehicle.year}`, 20, 90);
  doc.text(`Couleur: ${vehicle.color}`, 20, 95);

  // Informations du client
  doc.setFont(undefined, 'bold');
  doc.text('LOCATAIRE:', 20, 115);
  doc.setFont(undefined, 'normal');
  doc.text(`Nom: ${client.firstName} ${client.lastName}`, 20, 125);
  doc.text(`Téléphone: ${client.phone}`, 20, 130);
  doc.text(`N° Identité: ${client.idNumber}`, 20, 135);

  // Conditions de location
  doc.setFont(undefined, 'bold');
  doc.text('CONDITIONS DE LOCATION:', 20, 155);
  doc.setFont(undefined, 'normal');
  doc.text(`Période: du ${format(new Date(contract.startDate), 'dd/MM/yyyy')} au ${format(new Date(contract.endDate), 'dd/MM/yyyy')}`, 20, 165);
  doc.text(`Durée: ${contract.totalDays} jours`, 20, 170);
  doc.text(`Tarif journalier: ${formatNumber(contract.dailyRate)} FCFA`, 20, 175);
  doc.text(`Montant total: ${formatNumber(contract.totalAmount)} FCFA`, 20, 180);
  doc.text(`Assurance incluse: ${contract.insuranceIncluded ? 'Oui' : 'Non'}`, 20, 185);

  // Signatures
  doc.setLineWidth(0.5);
  doc.line(20, 210, 80, 210);
  doc.line(130, 210, 190, 210);
  doc.text('Signature du Loueur', 35, 217);
  doc.text('Signature du Locataire', 145, 217);
  
  doc.save(`Contrat_Location_${contract.contractNumber}.pdf`);
};

export const generateSaleContractPDF = (contract: SaleContract, vehicle: Vehicle, seller: any) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38); // Rouge
  doc.text('CONTRAT DE VENTE DE VÉHICULE', 105, 20, { align: 'center' });
  
  doc.setDrawColor(220, 38, 38);
  doc.line(20, 25, 190, 25);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  // Informations du contrat
  doc.text(`Contrat N°: ${contract.contractNumber}`, 20, 40);
  doc.text(`Date de vente: ${format(new Date(contract.saleDate), 'dd MMMM yyyy', { locale: fr })}`, 20, 50);

  // Informations du véhicule
  doc.setFont(undefined, 'bold');
  doc.text('VÉHICULE VENDU:', 20, 70);
  doc.setFont(undefined, 'normal');
  doc.text(`${vehicle.brand} ${vehicle.model}`, 20, 80);
  doc.text(`Immatriculation: ${vehicle.registration}`, 20, 85);
  doc.text(`Année: ${vehicle.year}`, 20, 90);
  doc.text(`Kilométrage: ${formatNumber(vehicle.mileage)} km`, 20, 95);

  // Informations des parties
  doc.setFont(undefined, 'bold');
  doc.text('VENDEUR:', 20, 115);
  doc.setFont(undefined, 'normal');
  doc.text(`Nom: ${contract.sellerName}`, 20, 125);

  doc.setFont(undefined, 'bold');
  doc.text('ACHETEUR:', 20, 145);
  doc.setFont(undefined, 'normal');
  doc.text(`Nom: ${contract.buyerName}`, 20, 155);
  doc.text(`Téléphone: ${contract.buyerPhone}`, 20, 160);
  doc.text(`N° Identité: ${contract.buyerIdNumber}`, 20, 165);

  // Conditions de vente
  doc.setFont(undefined, 'bold');
  doc.text('CONDITIONS DE VENTE:', 20, 185);
  doc.setFont(undefined, 'normal');
  doc.text(`Prix de vente: ${formatNumber(contract.salePrice)} FCFA`, 20, 195);
  doc.text(`Mode de paiement: ${contract.paymentMethod}`, 20, 200);
  doc.text(`Garantie: ${contract.warrantyMonths || 0} mois`, 20, 205);

  // Signatures
  doc.setLineWidth(0.5);
  doc.line(20, 230, 80, 230);
  doc.line(130, 230, 190, 230);
  doc.text('Signature du Vendeur', 35, 237);
  doc.text('Signature de l\'Acheteur', 145, 237);
  
  doc.save(`Contrat_Vente_${contract.contractNumber}.pdf`);
};