import React, { useState, useEffect } from 'react';
import api, { orderService, productService } from '../services/api';
import type { Order, Product, Category } from '../types';
import ProductManagement from './ProductManagement';
import PrinterManagement from './PrinterManagement';

const CaissierDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dailySales, setDailySales] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [categories, setCategories] = useState<Array<Category & { products: Product[] }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // États pour les nouvelles fonctionnalités
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [transferLocation, setTransferLocation] = useState('');
  const [transferType, setTransferType] = useState<'chambre' | 'passage'>('chambre');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'espece' | 'carte' | 'cheque'>('espece');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // États pour le Rapport Z
  const [showZReport, setShowZReport] = useState(false);
  const [zReportData, setZReportData] = useState<any>(null);
  
  // État pour les onglets
  const [activeTab, setActiveTab] = useState<'commandes' | 'produits' | 'imprimantes'>('commandes');
  
  // États pour recherche de ticket
  const [ticketSearchNumber, setTicketSearchNumber] = useState('');
  const [foundTicket, setFoundTicket] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // États pour paiements partiels
  const [partialPayments, setPartialPayments] = useState<Array<{method: string, amount: number}>>([]);
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [currentPartialAmount, setCurrentPartialAmount] = useState(0);
  const [currentPartialMethod, setCurrentPartialMethod] = useState<'espece' | 'carte' | 'cheque'>('espece');

  useEffect(() => {
    loadOrders();
    loadDailySales();
    loadProducts();

    const interval = setInterval(() => {
      loadOrders();
      loadDailySales();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  const loadDailySales = async () => {
    try {
      const data = await orderService.getDailySales();
      setDailySales(data);
    } catch (error) {
      console.error('Erreur chargement CA:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getGrouped();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const handleViewOrder = async (id: number) => {
    try {
      const order = await orderService.getById(id);
      setSelectedOrder(order);
      setEditMode(false);
      setDiscount(0);
      setPaymentAmount(order.total);
    } catch (error) {
      alert('Erreur lors du chargement de la commande');
    }
  };

  const addProductToOrder = async (product: Product) => {
    if (!selectedOrder) return;
    
    try {
      await orderService.addItems(selectedOrder.id, [{
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }]);
      
      handleViewOrder(selectedOrder.id);
      alert('Article ajouté !');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur');
    }
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (!selectedOrder || newQuantity < 1) return;
    
    const updatedItems = [...selectedOrder.items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = updatedItems[index].price * newQuantity;
    
    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      total: updatedItems.reduce((sum, item) => sum + item.total, 0)
    });
  };

  const removeItem = (index: number) => {
    if (!selectedOrder) return;
    
    const updatedItems = selectedOrder.items.filter((_: any, i: number) => i !== index);
    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      total: updatedItems.reduce((sum: number, item: any) => sum + item.total, 0)
    });
  };

  const saveOrderChanges = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderService.update(selectedOrder.id, { items: selectedOrder.items });
      alert('Commande mise à jour !');
      setEditMode(false);
      loadOrders();
      handleViewOrder(selectedOrder.id);
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const calculateFinalTotal = () => {
    if (!selectedOrder) return 0;
    
    let total = selectedOrder.total;
    
    if (discount > 0) {
      if (discountType === 'percentage') {
        total = total - (total * discount / 100);
      } else {
        total = total - discount;
      }
    }
    
    return Math.max(0, total);
  };

  const handleTransfer = async () => {
    if (!selectedOrder || !transferLocation) return;
    
    try {
      const newLocation = `${transferType === 'chambre' ? 'Chambre' : 'Passage'} ${transferLocation}`;
      await orderService.update(selectedOrder.id, { 
        clientName: newLocation,
        notes: newLocation 
      });
      
      alert(`Commande transférée vers ${newLocation}`);
      setShowTransferModal(false);
      loadOrders();
      handleViewOrder(selectedOrder.id);
    } catch (error) {
      alert('Erreur lors du transfert');
    }
  };

  const addPartialPayment = () => {
    if (currentPartialAmount <= 0) {
      alert('Montant invalide');
      return;
    }
    
    const finalTotal = calculateFinalTotal();
    const totalPaid = partialPayments.reduce((sum, p) => sum + p.amount, 0) + currentPartialAmount;
    
    if (totalPaid > finalTotal) {
      alert(`Le total des paiements (${totalPaid.toFixed(2)} MAD) dépasse le montant à payer (${finalTotal.toFixed(2)} MAD)`);
      return;
    }
    
    const methodLabel = currentPartialMethod === 'espece' ? 'Espèce' : 
                       currentPartialMethod === 'carte' ? 'Carte' : 'Chèque';
    
    setPartialPayments([...partialPayments, {
      method: methodLabel,
      amount: currentPartialAmount
    }]);
    
    setCurrentPartialAmount(0);
  };
  
  const removePartialPayment = (index: number) => {
    setPartialPayments(partialPayments.filter((_, i) => i !== index));
  };
  
  const completePartialPayment = async () => {
    if (!selectedOrder || partialPayments.length === 0) return;
    
    const finalTotal = calculateFinalTotal();
    const totalPaid = partialPayments.reduce((sum, p) => sum + p.amount, 0);
    
    if (totalPaid < finalTotal) {
      const remaining = finalTotal - totalPaid;
      const confirm = window.confirm(
        `Total payé: ${totalPaid.toFixed(2)} MAD\nReste à payer: ${remaining.toFixed(2)} MAD\n\nValider ce paiement partiel ?`
      );
      if (!confirm) return;
    }
    
    try {
      await orderService.update(selectedOrder.id, { 
        status: totalPaid >= finalTotal ? 'payee' : 'en_attente',
        paymentMethod: 'mixte',
        discount,
        discountType,
        paidAmount: totalPaid
      });
      
      // Imprimer le reçu avec paiements multiples
      printReceiptWithPartialPayments(selectedOrder, finalTotal, partialPayments);
      
      alert('Paiement enregistré !');
      setShowPartialPaymentModal(false);
      setPartialPayments([]);
      setSelectedOrder(null);
      loadOrders();
      loadDailySales();
    } catch (error) {
      alert('Erreur lors du paiement');
    }
  };

  const sendToReception = async (order: any) => {
    const roomNumber = prompt('Numéro de chambre:');
    if (!roomNumber) return;

    try {
      await api.post(`/orders/${order.id}/send-reception`, { roomNumber });
      
      // Si paiement TPE, imprimer automatiquement
      if (order.paymentMethod === 'carte') {
        printReceptionTicket(order, roomNumber);
      }
      
      alert(`Ticket envoyé à la chambre ${roomNumber}!`);
      loadOrders();
    } catch (error) {
      alert('Erreur lors de l\'envoi à la réception');
    }
  };

  const printReceptionTicket = (order: any, roomNumber: string) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const finalTotal = order.total - (order.discount || 0);

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket Réception</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            padding: 15px;
            margin: 0;
            font-size: 11px;
            max-width: 350px;
            color: #000;
          }
          h2 { text-align: center; font-size: 18px; margin: 10px 0; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .double-line { border-top: 2px solid #000; margin: 10px 0; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h2>YOU VOYAGE COMPANY</h2>
        <p class="center">🏨 TICKET RÉCEPTION</p>
        <div class="double-line"></div>
        <div class="line">
          <span>Chambre:</span>
          <strong>${roomNumber}</strong>
        </div>
        <div class="line">
          <span>Ticket:</span>
          <span>#${order.ticketNumber || order.id}</span>
        </div>
        <div class="line">
          <span>Date:</span>
          <span>${new Date().toLocaleString('fr-FR')}</span>
        </div>
        <div class="divider"></div>
        ${order.items?.map((item: any) => `
          <div class="line">
            <span>${item.quantity}x ${item.productName}</span>
            <span>${item.total.toFixed(2)} MAD</span>
          </div>
        `).join('') || ''}
        <div class="double-line"></div>
        <div class="line" style="font-weight: bold; font-size: 14px;">
          <span>TOTAL:</span>
          <span>${finalTotal.toFixed(2)} MAD</span>
        </div>
        ${order.paymentMethod === 'carte' ? `
          <p class="center" style="margin-top: 10px; font-weight: bold;">
            ✅ PAYÉ PAR CARTE
          </p>
        ` : ''}
        <p class="center" style="font-size: 9px; margin-top: 15px;">
          *** MERCI ***
        </p>
        <script>
          window.onload = function() { 
            setTimeout(function() {
              window.print(); 
              setTimeout(function() {
                window.close();
              }, 100);
            }, 250);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(ticketHTML);
    printWindow.document.close();
  };

  const handlePayment = async () => {
    if (!selectedOrder) return;
    
    const finalTotal = calculateFinalTotal();
    
    if (paymentAmount < finalTotal) {
      // Paiement partiel
      const remaining = finalTotal - paymentAmount;
      const confirm = window.confirm(
        `Paiement partiel de ${paymentAmount.toFixed(2)} MAD\nReste à payer: ${remaining.toFixed(2)} MAD\nContinuer ?`
      );
      
      if (!confirm) return;
    }
    
    try {
      await orderService.update(selectedOrder.id, { 
        status: 'payee',
        paymentMethod,
        discount,
        discountType,
        paidAmount: paymentAmount
      });
      
      // Imprimer le reçu
      printReceipt(selectedOrder, finalTotal, paymentAmount, paymentMethod);
      
      alert('Paiement enregistré !');
      setShowPaymentModal(false);
      setSelectedOrder(null);
      loadOrders();
      loadDailySales();
    } catch (error) {
      alert('Erreur lors du paiement');
    }
  };

  const printReceipt = (order: any, finalTotal: number, paid: number, method: string) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;
    
    // Extraire les commentaires si présents dans notes (format: "Location - Commentaire")
    const location = order.notes?.match(/(Chambre|Passage) \d+/)?.[0] || order.clientName || 'N/A';
    const comment = order.notes?.includes(' - ') ? order.notes.split(' - ').slice(1).join(' - ') : '';
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu #${order.id}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            padding: 10px;
            margin: 0;
            font-size: 12px;
            max-width: 280px;
          }
          h2 { text-align: center; margin: 10px 0; font-size: 16px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
          .total { font-weight: bold; font-size: 14px; margin-top: 5px; }
          .center { text-align: center; }
          .item { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h2>YOU VOYAGE COMPANY</h2>
        <p class="center" style="font-size: 10px; margin: 5px 0;">Tel: 06 16 73 41 71</p>
        <div class="divider"></div>
        <p><strong>Reçu #${order.id}</strong></p>
        ${order.ticketNumber ? `<p><strong>Ticket:</strong> ${order.ticketNumber}</p>` : ''}
        <p style="font-size: 10px;">${new Date(order.createdAt || new Date()).toLocaleString('fr-FR')}</p>
        <p><strong>Lieu:</strong> ${location}</p>
        ${comment ? `<p><strong>Commentaire:</strong> ${comment}</p>` : ''}
        <div class="divider"></div>
        ${order.items?.map((item: any) => `
          <div class="item">
            <div class="line">
              <span>${item.productName}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
            <div class="line" style="font-size: 10px; padding-left: 10px;">
              <span>x${item.quantity}</span>
              <span><strong>${item.total.toFixed(2)} MAD</strong></span>
            </div>
          </div>
        `).join('') || ''}
        <div class="divider"></div>
        <div class="line">
          <span>Sous-total:</span>
          <span>${order.total.toFixed(2)} MAD</span>
        </div>
        ${discount > 0 ? `
          <div class="line">
            <span>Remise (${discountType === 'percentage' ? discount + '%' : discount + ' MAD'}):</span>
            <span>-${(order.total - finalTotal).toFixed(2)} MAD</span>
          </div>
        ` : ''}
        <div class="divider"></div>
        <div class="line total">
          <span>TOTAL:</span>
          <span>${finalTotal.toFixed(2)} MAD</span>
        </div>
        <div class="line">
          <span>Payé (${method === 'espece' ? 'Espèce' : method === 'carte' ? 'Carte' : 'Chèque'}):</span>
          <span>${paid.toFixed(2)} MAD</span>
        </div>
        ${paid > finalTotal ? `
          <div class="line">
            <span>Rendu:</span>
            <span>${(paid - finalTotal).toFixed(2)} MAD</span>
          </div>
        ` : ''}
        ${paid < finalTotal ? `
          <div class="line" style="color: red;">
            <span>Reste à payer:</span>
            <span>${(finalTotal - paid).toFixed(2)} MAD</span>
          </div>
        ` : ''}
        <div class="divider"></div>
        <p class="center" style="font-size: 10px; margin-top: 10px;">Merci de votre visite!</p>
        <p class="center" style="font-size: 9px;">A bientôt</p>
        <script>
          window.onload = function() { 
            setTimeout(function() {
              window.print(); 
              setTimeout(function() {
                window.close();
              }, 100);
            }, 250);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };
  
  const printReceiptWithPartialPayments = (order: any, finalTotal: number, payments: Array<{method: string, amount: number}>) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;
    
    const location = order.notes?.match(/(Chambre|Passage) \d+/)?.[0] || order.clientName || 'N/A';
    const comment = order.notes?.includes(' - ') ? order.notes.split(' - ').slice(1).join(' - ') : '';
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu #${order.id}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            padding: 10px;
            margin: 0;
            font-size: 12px;
            max-width: 280px;
          }
          h2 { text-align: center; margin: 10px 0; font-size: 16px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
          .total { font-weight: bold; font-size: 14px; margin-top: 5px; }
          .center { text-align: center; }
          .item { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h2>YOU VOYAGE COMPANY</h2>
        <p class="center" style="font-size: 10px; margin: 5px 0;">Tel: 06 16 73 41 71</p>
        <div class="divider"></div>
        <p><strong>Reçu #${order.id}</strong></p>
        ${order.ticketNumber ? `<p><strong>Ticket:</strong> ${order.ticketNumber}</p>` : ''}
        <p style="font-size: 10px;">${new Date(order.createdAt || new Date()).toLocaleString('fr-FR')}</p>
        <p><strong>Lieu:</strong> ${location}</p>
        ${comment ? `<p><strong>Commentaire:</strong> ${comment}</p>` : ''}
        <div class="divider"></div>
        ${order.items?.map((item: any) => `
          <div class="item">
            <div class="line">
              <span>${item.productName}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
            <div class="line" style="font-size: 10px; padding-left: 10px;">
              <span>x${item.quantity}</span>
              <span><strong>${item.total.toFixed(2)} MAD</strong></span>
            </div>
          </div>
        `).join('') || ''}
        <div class="divider"></div>
        <div class="line">
          <span>Sous-total:</span>
          <span>${order.total.toFixed(2)} MAD</span>
        </div>
        ${discount > 0 ? `
          <div class="line">
            <span>Remise (${discountType === 'percentage' ? discount + '%' : discount + ' MAD'}):</span>
            <span>-${(order.total - finalTotal).toFixed(2)} MAD</span>
          </div>
        ` : ''}
        <div class="divider"></div>
        <div class="line total">
          <span>TOTAL:</span>
          <span>${finalTotal.toFixed(2)} MAD</span>
        </div>
        <div class="divider"></div>
        <p style="font-weight: bold; margin: 5px 0;">PAIEMENTS MULTIPLES:</p>
        ${payments.map((payment, idx) => `
          <div class="line" style="font-size: 11px;">
            <span>${idx + 1}. ${payment.method}:</span>
            <span>${payment.amount.toFixed(2)} MAD</span>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="line total">
          <span>Total payé:</span>
          <span>${totalPaid.toFixed(2)} MAD</span>
        </div>
        ${totalPaid < finalTotal ? `
          <div class="line" style="color: red; font-weight: bold;">
            <span>Reste à payer:</span>
            <span>${(finalTotal - totalPaid).toFixed(2)} MAD</span>
          </div>
        ` : ''}
        ${totalPaid > finalTotal ? `
          <div class="line">
            <span>Rendu:</span>
            <span>${(totalPaid - finalTotal).toFixed(2)} MAD</span>
          </div>
        ` : ''}
        <div class="divider"></div>
        <p class="center" style="font-size: 10px; margin-top: 10px;">Merci de votre visite!</p>
        <p class="center" style="font-size: 9px;">A bientôt</p>
        <script>
          window.onload = function() { 
            setTimeout(function() {
              window.print(); 
              setTimeout(function() {
                window.close();
              }, 100);
            }, 250);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const loadZReport = async () => {
    // Vérifier qu'il n'y a pas de commandes en attente
    const pendingOrders = orders.filter(o => o.status === 'en_attente');
    if (pendingOrders.length > 0) {
      alert(
        '⚠️ CLÔTURE IMPOSSIBLE ⚠️\n\n' +
        `Il reste ${pendingOrders.length} commande(s) en attente.\n\n` +
        'Vous devez d\'abord clôturer TOUTES les commandes\n' +
        '(paiement ou annulation) avant de générer le Rapport Z.'
      );
      return;
    }

    try {
      const data = await orderService.getZReport();
      setZReportData(data);
      setShowZReport(true);
    } catch (error) {
      alert('Erreur lors du chargement du Rapport Z');
      console.error(error);
    }
  };

  const handleSearchTicket = async () => {
    if (!ticketSearchNumber.trim()) {
      alert('Veuillez entrer un numéro de ticket');
      return;
    }

    try {
      const ticket = await orderService.searchByTicket(ticketSearchNumber);
      setFoundTicket(ticket);
      setShowTicketModal(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('Ticket non trouvé');
      } else {
        alert('Erreur lors de la recherche du ticket');
      }
    }
  };

  const handleReprintTicket = () => {
    if (!foundTicket) return;
    
    const finalTotal = foundTicket.total - (foundTicket.discount || 0);
    printReceipt(foundTicket, finalTotal, foundTicket.paidAmount || 0, foundTicket.paymentMethod || 'espece');
  };

  const handleClearSystem = async () => {
    console.log('🔵 handleClearSystem appelé');
    
    // Vérifier qu'il n'y a pas de commandes en attente
    const pendingOrders = orders.filter(o => o.status === 'en_attente');
    if (pendingOrders.length > 0) {
      alert(
        '⚠️ VIDAGE IMPOSSIBLE ⚠️\n\n' +
        `Il reste ${pendingOrders.length} commande(s) en attente.\n\n` +
        'Vous devez d\'abord clôturer TOUTES les commandes\n' +
        '(paiement ou annulation) avant de vider le système.'
      );
      return;
    }

    const confirm = window.confirm(
      '⚠️ ATTENTION ⚠️\n\n' +
      'Cette action va supprimer TOUTES les commandes payées et annulées du système.\n\n' +
      'Cette action est IRRÉVERSIBLE.\n\n' +
      'Voulez-vous continuer ?'
    );

    console.log('🔵 Premier confirm:', confirm);
    if (!confirm) return;

    const doubleConfirm = window.confirm(
      'Êtes-vous VRAIMENT sûr de vouloir vider le système ?\n\n' +
      'Dernière chance pour annuler.'
    );

    console.log('🔵 Double confirm:', doubleConfirm);
    if (!doubleConfirm) return;

    try {
      console.log('🔵 Appel API clearSystem...');
      const result = await orderService.clearSystem();
      console.log('✅ Résultat API:', result);
      alert(`✅ ${result.message}`);
      await loadOrders();
      await loadDailySales();
      setShowZReport(false);
    } catch (error: any) {
      console.error('❌ Erreur clearSystem:', error);
      alert('❌ Erreur lors du vidage du système\n\n' + (error.response?.data?.error || error.message));
    }
  };

  const printZReport = () => {
    if (!zReportData) return;
    
    const printWindow = window.open('', '', 'width=400,height=700');
    if (!printWindow) return;
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport Z - ${zReportData.date}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            padding: 15px;
            margin: 0;
            font-size: 11px;
            max-width: 350px;
          }
          h2, h3 { text-align: center; margin: 10px 0; }
          h2 { font-size: 18px; }
          h3 { font-size: 14px; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .double-line { border-top: 2px solid #000; margin: 10px 0; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
          .total { font-weight: bold; font-size: 13px; margin-top: 5px; }
          .center { text-align: center; }
          .section { margin: 15px 0; }
          .item-line { margin: 2px 0; font-size: 10px; }
        </style>
      </head>
      <body>
        <h2>YOU VOYAGE COMPANY</h2>
        <p class="center" style="font-size: 10px;">Tel: 06 16 73 41 71</p>
        <div class="double-line"></div>
        <h3>RAPPORT Z</h3>
        <p class="center"><strong>Date: ${new Date(zReportData.date).toLocaleDateString('fr-FR')}</strong></p>
        <p class="center" style="font-size: 9px;">Imprimé le: ${new Date().toLocaleString('fr-FR')}</p>
        <div class="divider"></div>
        
        <div class="section">
          <h3>ARTICLES VENDUS</h3>
          ${zReportData.itemsSummary.map((item: any) => `
            <div class="item-line">
              <div class="line">
                <span>${item.name}</span>
                <span>x${item.quantity}</span>
              </div>
              <div class="line" style="padding-left: 20px;">
                <span>${item.price.toFixed(2)} MAD/u</span>
                <span><strong>${item.total.toFixed(2)} MAD</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="divider"></div>
        
        ${zReportData.drinksDetails && zReportData.drinksDetails.length > 0 ? `
        <div class="section">
          <h3>🥤 DÉTAILS BOISSONS</h3>
          ${zReportData.drinksDetails.map((drink: any) => `
            <div class="item-line">
              <div class="line">
                <span>${drink.name}</span>
                <span>x${drink.quantity}</span>
              </div>
              <div class="line" style="padding-left: 20px;">
                <span>${drink.price.toFixed(2)} MAD/u</span>
                <span><strong>${drink.total.toFixed(2)} MAD</strong></span>
              </div>
            </div>
          `).join('')}
          <div class="double-line"></div>
          <div class="line total">
            <span>TOTAL BOISSONS:</span>
            <span>${zReportData.drinksDetails.reduce((sum: number, d: any) => sum + d.total, 0).toFixed(2)} MAD</span>
          </div>
        </div>
        
        <div class="divider"></div>
        ` : ''}
        
        <div class="section">
          <h3>MODES DE PAIEMENT</h3>
          ${zReportData.paymentSummary.map((payment: any) => `
            <div class="line">
              <span>${payment.paymentMethod === 'espece' ? 'Espèce' : payment.paymentMethod === 'carte' ? 'Carte' : 'Chèque'} (${payment.count} commande${payment.count > 1 ? 's' : ''}):</span>
              <span><strong>${payment.total.toFixed(2)} MAD</strong></span>
            </div>
            ${payment.paidAmount !== payment.total ? `
              <div class="line" style="font-size: 9px; padding-left: 20px;">
                <span>Montant perçu:</span>
                <span>${payment.paidAmount.toFixed(2)} MAD</span>
              </div>
            ` : ''}
          `).join('')}
        </div>
        
        <div class="double-line"></div>
        
        <div class="section">
          <div class="line">
            <span>Nombre de commandes:</span>
            <span><strong>${zReportData.orders}</strong></span>
          </div>
          <div class="divider"></div>
          <div class="line">
            <span>Ventes brutes:</span>
            <span>${zReportData.totalSales.toFixed(2)} MAD</span>
          </div>
          <div class="line">
            <span>Remises accordées:</span>
            <span>-${zReportData.totalDiscount.toFixed(2)} MAD</span>
          </div>
          <div class="double-line"></div>
          <div class="line total" style="font-size: 16px;">
            <span>TOTAL NET:</span>
            <span>${(zReportData.totalSales - zReportData.totalDiscount).toFixed(2)} MAD</span>
          </div>
        </div>
        
        <div class="divider"></div>
        <p class="center" style="font-size: 9px; margin-top: 15px;">*** FIN DU RAPPORT Z ***</p>
        
        <script>
          window.onload = function() { 
            setTimeout(function() {
              window.print(); 
              setTimeout(function() {
                window.close();
              }, 100);
            }, 250);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => 
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#333', margin: 0 }}>Caisse - Tableau de bord</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={loadZReport}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer', 
              fontWeight: '600',
              boxShadow: '0 2px 5px rgba(40, 167, 69, 0.3)'
            }}
          >
            📊 Rapport Z
          </button>
          <button
            onClick={loadOrders}
            style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #dee2e6' }}>
        <button
          onClick={() => setActiveTab('commandes')}
          style={{
            padding: '1rem 2rem',
            background: activeTab === 'commandes' ? '#667eea' : 'transparent',
            color: activeTab === 'commandes' ? 'white' : '#667eea',
            border: 'none',
            borderBottom: activeTab === 'commandes' ? 'none' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          📋 Gestion des Commandes
        </button>
        <button
          onClick={() => setActiveTab('produits')}
          style={{
            padding: '1rem 2rem',
            background: activeTab === 'produits' ? '#667eea' : 'transparent',
            color: activeTab === 'produits' ? 'white' : '#667eea',
            border: 'none',
            borderBottom: activeTab === 'produits' ? 'none' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          🍽️ Produits & Catégories
        </button>
        <button
          onClick={() => setActiveTab('imprimantes')}
          style={{
            padding: '1rem 2rem',
            background: activeTab === 'imprimantes' ? '#667eea' : 'transparent',
            color: activeTab === 'imprimantes' ? 'white' : '#667eea',
            border: 'none',
            borderBottom: activeTab === 'imprimantes' ? 'none' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          🖨️ Imprimantes
        </button>
      </div>

      {activeTab === 'commandes' ? (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>CA Journalier</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745' }}>{dailySales?.totalSales?.toFixed(2) || 0} MAD</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Commandes payées</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>{dailySales?.orderCount || 0}</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>En attente</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ffc107' }}>{orders.filter(o => o.status === 'en_attente').length}</p>
            </div>
          </div>

          {/* Recherche */}
          <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 Rechercher par client, chambre, passage ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #667eea',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Recherche de ticket */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#667eea' }}>🎫 Rechercher un ticket</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Entrer le numéro de ticket (ex: 20231205-12345)"
            value={ticketSearchNumber}
            onChange={(e) => setTicketSearchNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchTicket()}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '2px solid #dee2e6',
              borderRadius: '5px',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSearchTicket}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            🔍 Rechercher
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 1.5fr' : '1fr', gap: '1.5rem' }}>
        {/* Liste des commandes */}
        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ padding: '1rem', margin: 0, background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            Commandes ({filteredOrders.length})
          </h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredOrders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                <p>Aucune commande</p>
              </div>
            ) : (
              filteredOrders.map((order: any) => (
                <div
                  key={order.id}
                  onClick={() => handleViewOrder(order.id)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #dee2e6',
                    cursor: 'pointer',
                    background: selectedOrder?.id === order.id ? '#f0f4ff' : 'white',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>#{order.id} - {order.clientName || 'N/A'}</strong>
                      {order.ticketNumber && (
                        <div style={{ fontSize: '0.75rem', color: '#667eea', marginTop: '0.25rem' }}>
                          🎫 {order.ticketNumber}
                        </div>
                      )}
                      {order.status === 'payee' && (
                        <div style={{ fontSize: '0.75rem', color: '#dc3545', marginTop: '0.25rem', fontWeight: '600' }}>
                          🔒 Ticket verrouillé
                        </div>
                      )}
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: order.status === 'payee' ? '#28a745' : order.status === 'en_attente' ? '#ffc107' : '#dc3545',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.75rem'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {order.notes && <div>{order.notes}</div>}
                    <div>{new Date(order.createdAt || '').toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#28a745', marginTop: '0.5rem' }}>
                    {order.total.toFixed(2)} MAD
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Détails de la commande sélectionnée */}
        {selectedOrder && (
          <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '2px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Commande #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {/* Infos commande */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Client:</strong> {selectedOrder.clientName || 'N/A'}</p>
                <p><strong>Notes:</strong> {selectedOrder.notes || 'N/A'}</p>
                <p><strong>Serveur:</strong> {selectedOrder.prenom} {selectedOrder.nom}</p>
                <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</p>
              </div>

              {/* Mode édition - Ajouter des articles */}
              {editMode && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '2px solid #ffc107' }}>
                  <h4 style={{ marginTop: 0, color: '#856404' }}>Ajouter des articles</h4>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: selectedCategory === cat.id ? '#667eea' : 'white',
                          color: selectedCategory === cat.id ? 'white' : '#333',
                          border: '2px solid #667eea',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {currentCategory?.products?.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addProductToOrder(product)}
                        style={{
                          padding: '0.75rem',
                          background: 'white',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{product.name}</div>
                        <div style={{ color: '#28a745', fontWeight: '700' }}>{product.price.toFixed(2)} MAD</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des articles */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Articles ({selectedOrder.items?.length || 0})</h4>
                  {selectedOrder.status !== 'payee' && (
                    <button
                      onClick={() => setEditMode(!editMode)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: editMode ? '#dc3545' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {editMode ? '✓ Terminer' : '✏️ Modifier'}
                    </button>
                  )}
                  {selectedOrder.status === 'payee' && (
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: '#f8f9fa',
                      color: '#666',
                      border: '2px solid #dee2e6',
                      borderRadius: '5px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      🔒 Ticket verrouillé
                    </div>
                  )}
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div>
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} style={{
                        padding: '0.75rem',
                        background: '#f8f9fa',
                        marginBottom: '0.5rem',
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600' }}>{item.productName}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.price.toFixed(2)} MAD</div>
                        </div>
                        
                        {editMode ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              style={{ padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              style={{ padding: '0.25rem 0.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(index)}
                              style={{ padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '0.5rem' }}
                            >
                              🗑️
                            </button>
                            <div style={{ fontWeight: '700', color: '#28a745', minWidth: '70px', textAlign: 'right' }}>
                              {item.total.toFixed(2)} MAD
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span>x{item.quantity}</span>
                            <div style={{ fontWeight: '700', color: '#28a745', minWidth: '70px', textAlign: 'right' }}>
                              {item.total.toFixed(2)} MAD
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Aucun article</p>
                )}

                {editMode && (
                  <button
                    onClick={saveOrderChanges}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      marginTop: '1rem'
                    }}
                  >
                    💾 Enregistrer les modifications
                  </button>
                )}
              </div>

              {/* Remise */}
              {!editMode && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#e7f3ff', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0 }}>Remise</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <button
                      onClick={() => setDiscountType('percentage')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: discountType === 'percentage' ? '#667eea' : 'white',
                        color: discountType === 'percentage' ? 'white' : '#333',
                        border: '2px solid #667eea',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Pourcentage (%)
                    </button>
                    <button
                      onClick={() => setDiscountType('amount')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: discountType === 'amount' ? '#667eea' : 'white',
                        color: discountType === 'amount' ? 'white' : '#333',
                        border: '2px solid #667eea',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Montant (MAD)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder={discountType === 'percentage' ? '0%' : '0 MAD'}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '2px solid #667eea',
                      borderRadius: '5px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              )}

              {/* Total */}
              <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Sous-total:</span>
                  <span>{selectedOrder.total.toFixed(2)} MAD</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#dc3545' }}>
                    <span>Remise ({discountType === 'percentage' ? `${discount}%` : `${discount} MAD`}):</span>
                    <span>-{(selectedOrder.total - calculateFinalTotal()).toFixed(2)} MAD</span>
                  </div>
                )}
                <div style={{ borderTop: '2px solid #dee2e6', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: '#28a745' }}>
                    <span>TOTAL:</span>
                    <span>{calculateFinalTotal().toFixed(2)} MAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            {!editMode && selectedOrder.status === 'en_attente' && (
              <div style={{ padding: '1rem', background: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    style={{
                      padding: '0.75rem',
                      background: '#ffc107',
                      color: '#333',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Transférer
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1rem'
                    }}
                  >
                    💰 PAYER
                  </button>
                  <button
                    onClick={() => {
                      setShowPartialPaymentModal(true);
                      setPartialPayments([]);
                      setCurrentPartialAmount(0);
                    }}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1rem'
                    }}
                  >
                    👥 PAIEMENTS MULTIPLES
                  </button>
                  <button
                    onClick={() => sendToReception(selectedOrder)}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '1rem'
                    }}
                  >
                    🏨 TICKET RÉCEPTION
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1.1rem', fontWeight: '600', color: '#667eea' }}>
                  Total: {calculateFinalTotal().toFixed(2)} MAD
                </div>
              </div>
            )}
            {/* Message pour tickets payés */}
            {selectedOrder.status === 'payee' && (
              <div style={{ padding: '1.5rem', background: '#f8f9fa', borderTop: '2px solid #dee2e6', textAlign: 'center' }}>
                <div style={{ color: '#28a745', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  🔒 Ticket Payé et Verrouillé
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  Ce ticket ne peut plus être modifié, transféré ou supprimé.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Transfert */}
      {showTransferModal && (
        <div
          onClick={() => setShowTransferModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            <h3 style={{ marginTop: 0 }}>Transférer la commande #{selectedOrder?.id}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Type</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setTransferType('chambre')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: transferType === 'chambre' ? '#667eea' : 'white',
                    color: transferType === 'chambre' ? 'white' : '#333',
                    border: '2px solid #667eea',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Chambre
                </button>
                <button
                  onClick={() => setTransferType('passage')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: transferType === 'passage' ? '#667eea' : 'white',
                    color: transferType === 'passage' ? 'white' : '#333',
                    border: '2px solid #667eea',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Passage
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Numéro</label>
              <input
                type="text"
                value={transferLocation}
                onChange={(e) => setTransferLocation(e.target.value)}
                placeholder={transferType === 'chambre' ? 'Ex: 01' : 'Ex: 1'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #667eea',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowTransferModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleTransfer}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {showPaymentModal && (
        <div
          onClick={() => setShowPaymentModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            <h3 style={{ marginTop: 0 }}>Paiement - Commande #{selectedOrder?.id}</h3>
            
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: '#28a745' }}>
                <span>Montant à payer:</span>
                <span>{calculateFinalTotal().toFixed(2)} MAD</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mode de paiement</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => setPaymentMethod('espece')}
                  style={{
                    padding: '0.75rem',
                    background: paymentMethod === 'espece' ? '#28a745' : 'white',
                    color: paymentMethod === 'espece' ? 'white' : '#333',
                    border: '2px solid #28a745',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  💵 Espèce
                </button>
                <button
                  onClick={() => setPaymentMethod('carte')}
                  style={{
                    padding: '0.75rem',
                    background: paymentMethod === 'carte' ? '#28a745' : 'white',
                    color: paymentMethod === 'carte' ? 'white' : '#333',
                    border: '2px solid #28a745',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  💳 Carte
                </button>
                <button
                  onClick={() => setPaymentMethod('cheque')}
                  style={{
                    padding: '0.75rem',
                    background: paymentMethod === 'cheque' ? '#28a745' : 'white',
                    color: paymentMethod === 'cheque' ? 'white' : '#333',
                    border: '2px solid #28a745',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  📝 Chèque
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Montant reçu (MAD)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #28a745',
                  borderRadius: '5px',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}
              />
              {paymentAmount > calculateFinalTotal() && (
                <p style={{ color: '#28a745', marginTop: '0.5rem', fontWeight: '600' }}>
                  Rendu: {(paymentAmount - calculateFinalTotal()).toFixed(2)} MAD
                </p>
              )}
              {paymentAmount < calculateFinalTotal() && paymentAmount > 0 && (
                <p style={{ color: '#dc3545', marginTop: '0.5rem', fontWeight: '600' }}>
                  Reste: {(calculateFinalTotal() - paymentAmount).toFixed(2)} MAD (Paiement partiel)
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentAmount <= 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: paymentAmount > 0 ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: paymentAmount > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiements Multiples */}
      {showPartialPaymentModal && (
        <div
          onClick={() => setShowPartialPaymentModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ marginTop: 0 }}>👥 Paiements Multiples - Commande #{selectedOrder?.id}</h3>
            
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Montant total:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#667eea' }}>
                  {calculateFinalTotal().toFixed(2)} MAD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Déjà payé:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#28a745' }}>
                  {partialPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} MAD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #dee2e6', paddingTop: '0.5rem' }}>
                <span style={{ fontWeight: '700' }}>Reste à payer:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#dc3545' }}>
                  {(calculateFinalTotal() - partialPayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)} MAD
                </span>
              </div>
            </div>

            {/* Liste des paiements déjà ajoutés */}
            {partialPayments.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>Paiements enregistrés:</h4>
                <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.75rem' }}>
                  {partialPayments.map((payment, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: 'white',
                        borderRadius: '5px',
                        marginBottom: idx < partialPayments.length - 1 ? '0.5rem' : 0
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>
                        {idx + 1}. {payment.method}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#28a745' }}>
                          {payment.amount.toFixed(2)} MAD
                        </span>
                        <button
                          onClick={() => removePartialPayment(idx)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ajouter un nouveau paiement */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#e7f3ff', borderRadius: '8px' }}>
              <h4 style={{ marginTop: 0 }}>Ajouter un paiement:</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mode de paiement</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => setCurrentPartialMethod('espece')}
                    style={{
                      padding: '0.75rem',
                      background: currentPartialMethod === 'espece' ? '#28a745' : 'white',
                      color: currentPartialMethod === 'espece' ? 'white' : '#333',
                      border: '2px solid #28a745',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    💵 Espèce
                  </button>
                  <button
                    onClick={() => setCurrentPartialMethod('carte')}
                    style={{
                      padding: '0.75rem',
                      background: currentPartialMethod === 'carte' ? '#28a745' : 'white',
                      color: currentPartialMethod === 'carte' ? 'white' : '#333',
                      border: '2px solid #28a745',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    💳 Carte
                  </button>
                  <button
                    onClick={() => setCurrentPartialMethod('cheque')}
                    style={{
                      padding: '0.75rem',
                      background: currentPartialMethod === 'cheque' ? '#28a745' : 'white',
                      color: currentPartialMethod === 'cheque' ? 'white' : '#333',
                      border: '2px solid #28a745',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📝 Chèque
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Montant (MAD)</label>
                <input
                  type="number"
                  value={currentPartialAmount || ''}
                  onChange={(e) => setCurrentPartialAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Montant à payer"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #17a2b8',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}
                />
              </div>

              <button
                onClick={addPartialPayment}
                disabled={currentPartialAmount <= 0}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: currentPartialAmount > 0 ? '#17a2b8' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: currentPartialAmount > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                ➕ Ajouter ce paiement
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowPartialPaymentModal(false);
                  setPartialPayments([]);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
              <button
                onClick={completePartialPayment}
                disabled={partialPayments.length === 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: partialPayments.length > 0 ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: partialPayments.length > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                ✅ Valider le paiement
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : activeTab === 'produits' ? (
        <ProductManagement />
      ) : activeTab === 'imprimantes' ? (
        <PrinterManagement />
      ) : null}

      {/* Modal Rapport Z */}
      {showZReport && zReportData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>📊 Rapport Z</h2>
              <button
                onClick={() => setShowZReport(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✕ Fermer
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                <strong>Date:</strong> {new Date(zReportData.date).toLocaleDateString('fr-FR')}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                Imprimé le: {new Date().toLocaleString('fr-FR')}
              </p>
            </div>

            {/* Articles vendus */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                padding: '0.75rem', 
                background: '#667eea', 
                color: 'white', 
                margin: '0 0 1rem 0', 
                borderRadius: '5px' 
              }}>
                Articles vendus
              </h3>
              <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#333' }}>Article</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Qté</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6', color: '#333' }}>Prix unit.</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6', color: '#333' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zReportData.itemsSummary.map((item: any, index: number) => (
                      <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '0.75rem', color: '#333' }}>{item.name}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#333' }}>{item.quantity}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#333' }}>{item.price.toFixed(2)} MAD</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#333' }}>{item.total.toFixed(2)} MAD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section Boissons */}
            {zReportData.drinksDetails && zReportData.drinksDetails.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  padding: '0.75rem', 
                  background: '#17a2b8', 
                  color: 'white', 
                  margin: '0 0 1rem 0', 
                  borderRadius: '5px' 
                }}>
                  🥤 Détails des Boissons
                </h3>
                <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6', color: '#333' }}>Boisson</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', color: '#333' }}>Qté</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6', color: '#333' }}>Prix unit.</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6', color: '#333' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zReportData.drinksDetails.map((drink: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '0.75rem', color: '#333' }}>
                            <strong>{drink.name}</strong>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#17a2b8' }}>{drink.quantity}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: '#333' }}>{drink.price.toFixed(2)} MAD</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#17a2b8' }}>{drink.total.toFixed(2)} MAD</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#e3f2fd', fontWeight: '700' }}>
                        <td colSpan={2} style={{ padding: '0.75rem', textAlign: 'right', color: '#333' }}>TOTAL BOISSONS:</td>
                        <td colSpan={2} style={{ padding: '0.75rem', textAlign: 'right', fontSize: '1.1rem', color: '#17a2b8' }}>
                          {zReportData.drinksDetails.reduce((sum: number, d: any) => sum + d.total, 0).toFixed(2)} MAD
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modes de paiement */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                padding: '0.75rem', 
                background: '#28a745', 
                color: 'white', 
                margin: '0 0 1rem 0', 
                borderRadius: '5px' 
              }}>
                Modes de paiement
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {zReportData.paymentSummary.map((payment: any, index: number) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '1rem', 
                      background: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '2px solid #dee2e6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: '#333' }}>
                          {payment.paymentMethod === 'espece' ? '💵 Espèce' : 
                           payment.paymentMethod === 'carte' ? '💳 Carte' : '📝 Chèque'}
                        </strong>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                          {payment.count} commande{payment.count > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#28a745' }}>
                          {payment.total.toFixed(2)} MAD
                        </p>
                        {payment.paidAmount !== payment.total && (
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                            Montant perçu: {payment.paidAmount.toFixed(2)} MAD
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totaux */}
            <div style={{ 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Nombre de commandes:</span>
                <strong style={{ fontSize: '1.2rem' }}>{zReportData.orders}</strong>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', margin: '0.75rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Ventes brutes:</span>
                <strong>{zReportData.totalSales.toFixed(2)} MAD</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Remises accordées:</span>
                <strong>-{zReportData.totalDiscount.toFixed(2)} MAD</strong>
              </div>
              <div style={{ borderTop: '2px solid rgba(255,255,255,0.5)', margin: '0.75rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.3rem' }}>TOTAL NET:</span>
                <strong style={{ fontSize: '1.8rem' }}>
                  {(zReportData.totalSales - zReportData.totalDiscount).toFixed(2)} MAD
                </strong>
              </div>
            </div>

            {/* Avertissement si commandes en attente */}
            {orders.filter(o => o.status === 'en_attente').length > 0 && (
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: 'white',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '0.95rem',
                boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)'
              }}>
                ⚠️ CLÔTURER D'ABORD LES {orders.filter(o => o.status === 'en_attente').length} COMMANDE(S) EN ATTENTE
              </div>
            )}

            {/* Boutons d'action */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={printZReport}
                style={{
                  padding: '1rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)'
                }}
              >
                🖨️ Imprimer le Rapport Z
              </button>
              <button
                onClick={handleClearSystem}
                style={{
                  padding: '1rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 10px rgba(220, 53, 69, 0.3)'
                }}
              >
                🗑️ Vider le Système
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ticket Trouvé */}
      {showTicketModal && foundTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>🎫 Ticket Trouvé</h2>
              <button
                onClick={() => { setShowTicketModal(false); setFoundTicket(null); }}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✕ Fermer
              </button>
            </div>

            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Numéro de ticket</p>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: '#667eea' }}>
                    {foundTicket.ticketNumber}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Commande #{foundTicket.id}</p>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>
                    {foundTicket.clientName || 'N/A'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Date</p>
                  <p style={{ margin: 0, fontWeight: '600' }}>
                    {new Date(foundTicket.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>Statut</p>
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: foundTicket.status === 'payee' ? '#28a745' : foundTicket.status === 'en_attente' ? '#ffc107' : '#dc3545',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {foundTicket.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Articles</h3>
              <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                {foundTicket.items?.map((item: any, index: number) => (
                  <div key={index} style={{ 
                    padding: '1rem', 
                    borderBottom: index < foundTicket.items.length - 1 ? '1px solid #dee2e6' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <strong>{item.productName}</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>
                        x{item.quantity} à {item.price.toFixed(2)} MAD
                      </p>
                    </div>
                    <div style={{ fontWeight: '700', color: '#28a745' }}>
                      {item.total.toFixed(2)} MAD
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totaux */}
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Sous-total:</span>
                <strong>{foundTicket.total.toFixed(2)} MAD</strong>
              </div>
              {foundTicket.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#dc3545' }}>
                  <span>Remise:</span>
                  <strong>-{foundTicket.discount.toFixed(2)} MAD</strong>
                </div>
              )}
              <div style={{ borderTop: '2px solid #dee2e6', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                  <strong>TOTAL:</strong>
                  <strong style={{ color: '#28a745' }}>
                    {(foundTicket.total - (foundTicket.discount || 0)).toFixed(2)} MAD
                  </strong>
                </div>
              </div>
              {foundTicket.paymentMethod && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span>Payé ({foundTicket.paymentMethod === 'espece' ? 'Espèce' : foundTicket.paymentMethod === 'carte' ? 'Carte' : 'Chèque'}):</span>
                    <strong>{(foundTicket.paidAmount || 0).toFixed(2)} MAD</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton réimprimer */}
            <button
              onClick={handleReprintTicket}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
              }}
            >
              🖨️ Réimprimer le Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaissierDashboard;
