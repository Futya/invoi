document.addEventListener('DOMContentLoaded', function() {
    // Инициализация элементов
    const addItemBtn = document.getElementById('add-item');
    const itemsTable = document.getElementById('items-table').getElementsByTagName('tbody')[0];
    const previewBtn = document.getElementById('preview-invoice');
    const closePreviewBtn = document.getElementById('close-preview');
    const printBtn = document.getElementById('print-invoice');
    const clearBtn = document.getElementById('clear-form');
    const generatePdfBtn = document.getElementById('generate-pdf');
    const previewModal = document.getElementById('invoice-preview');
    const previewContent = document.getElementById('preview-content');

    // Добавление новой позиции в счет
    addItemBtn.addEventListener('click', function() {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" class="item-desc"></td>
            <td><input type="number" class="item-qty" min="1" value="1"></td>
            <td><input type="number" class="item-price" min="0" step="0.01" value="0"></td>
            <td class="item-total">0.00</td>
            <td><button class="remove-item">×</button></td>
        `;
        itemsTable.appendChild(newRow);
        
        // Добавление обработчиков событий для новой строки
        addItemEventListeners(newRow);
    });

    // Функция для добавления обработчиков событий к строке с позицией
    function addItemEventListeners(row) {
        const qtyInput = row.querySelector('.item-qty');
        const priceInput = row.querySelector('.item-price');
        const totalCell = row.querySelector('.item-total');
        const removeBtn = row.querySelector('.remove-item');
        
        // Функция обновления суммы позиции
        function updateItemTotal() {
            const qty = parseFloat(qtyInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = qty * price;
            totalCell.textContent = total.toFixed(2);
            updateTotals();
        }
        
        // Обработчики событий
        qtyInput.addEventListener('input', updateItemTotal);
        priceInput.addEventListener('input', updateItemTotal);
        
        removeBtn.addEventListener('click', function() {
            row.remove();
            updateTotals();
        });
    }

    // Инициализация обработчиков для существующих строк
    document.querySelectorAll('#items-table tbody tr').forEach(row => {
        addItemEventListeners(row);
    });

    // Обновление итоговых сумм
    function updateTotals() {
        let subtotal = 0;
        document.querySelectorAll('.item-total').forEach(cell => {
            subtotal += parseFloat(cell.textContent) || 0;
        });
        
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const grandTotal = subtotal + taxAmount;
        
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('tax-amount').textContent = taxAmount.toFixed(2);
        document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
    }

    // Обработчик изменения налоговой ставки
    document.getElementById('tax-rate').addEventListener('input', updateTotals);

    // Предпросмотр счета
    previewBtn.addEventListener('click', function() {
        const invoiceData = collectInvoiceData();
        renderInvoicePreview(invoiceData);
        previewModal.classList.remove('hidden');
    });

    // Закрытие предпросмотра
    closePreviewBtn.addEventListener('click', function() {
        previewModal.classList.add('hidden');
    });

    // Печать счета
    printBtn.addEventListener('click', function() {
        window.print();
    });

    // Очистка формы
    clearBtn.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите очистить форму?')) {
            document.querySelectorAll('input').forEach(input => {
                if (input.type !== 'button') {
                    input.value = '';
                }
            });
            document.getElementById('items-table').querySelector('tbody').innerHTML = `
                <tr>
                    <td><input type="text" class="item-desc"></td>
                    <td><input type="number" class="item-qty" min="1" value="1"></td>
                    <td><input type="number" class="item-price" min="0" step="0.01" value="0"></td>
                    <td class="item-total">0.00</td>
                    <td><button class="remove-item">×</button></td>
                </tr>
            `;
            updateTotals();
            document.querySelectorAll('#items-table tbody tr').forEach(row => {
                addItemEventListeners(row);
            });
        }
    });

    // Генерация PDF
    generatePdfBtn.addEventListener('click', function() {
        const invoiceData = collectInvoiceData();
        generatePdf(invoiceData);
    });

    // Сбор данных счета
    function collectInvoiceData() {
        const items = [];
        document.querySelectorAll('#items-table tbody tr').forEach(row => {
            items.push({
                description: row.querySelector('.item-desc').value,
                quantity: parseFloat(row.querySelector('.item-qty').value) || 0,
                price: parseFloat(row.querySelector('.item-price').value) || 0,
                total: parseFloat(row.querySelector('.item-total').textContent) || 0
            });
        });
        
        return {
            seller: {
                name: document.getElementById('seller-name').value,
                address: document.getElementById('seller-address').value,
                phone: document.getElementById('seller-phone').value,
                email: document.getElementById('seller-email').value
            },
            buyer: {
                name: document.getElementById('buyer-name').value,
                address: document.getElementById('buyer-address').value,
                phone: document.getElementById('buyer-phone').value,
                email: document.getElementById('buyer-email').value
            },
            invoiceDetails: {
                number: document.getElementById('invoice-number').value,
                date: document.getElementById('invoice-date').value,
                dueDate: document.getElementById('due-date').value
            },
            items: items,
            totals: {
                subtotal: parseFloat(document.getElementById('subtotal').textContent) || 0,
                taxRate: parseFloat(document.getElementById('tax-rate').value) || 0,
                taxAmount: parseFloat(document.getElementById('tax-amount').textContent) || 0,
                grandTotal: parseFloat(document.getElementById('grand-total').textContent) || 0
            }
        };
    }

    // Рендер предпросмотра счета
    function renderInvoicePreview(data) {
        let html = `
            <div class="invoice-header">
                <h1>Счет №${data.invoiceDetails.number}</h1>
                <p>Дата: ${data.invoiceDetails.date}</p>
                <p>Срок оплаты: ${data.invoiceDetails.dueDate}</p>
            </div>
            
            <div class="invoice-parties">
                <div class="seller-info">
                    <h3>Продавец:</h3>
                    <p>${data.seller.name}</p>
                    <p>${data.seller.address}</p>
                    <p>Телефон: ${data.seller.phone}</p>
                    <p>Email: ${data.seller.email}</p>
                </div>
                
                <div class="buyer-info">
                    <h3>Покупатель:</h3>
                    <p>${data.buyer.name}</p>
                    <p>${data.buyer.address}</p>
                    <p>Телефон: ${data.buyer.phone}</p>
                    <p>Email: ${data.buyer.email}</p>
                </div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Описание</th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.items.forEach(item => {
            html += `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
            
            <div class="invoice-totals">
                <div class="total-row">
                    <span>Промежуточный итог:</span>
                    <span>${data.totals.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Налог (${data.totals.taxRate}%):</span>
                    <span>${data.totals.taxAmount.toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Общая сумма:</span>
                    <span>${data.totals.grandTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="invoice-footer">
                <p>Спасибо за ваш бизнес!</p>
            </div>
        `;
        
        previewContent.innerHTML = html;
    }

    // Генерация PDF (использует jsPDF)
    function generatePdf(data) {
        // Проверяем, загружена ли библиотека jsPDF
        if (typeof jsPDF !== 'function') {
            alert('Библиотека jsPDF не загружена. Невозможно создать PDF.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Заголовок счета
        doc.setFontSize(18);
        doc.text(`Счет №${data.invoiceDetails.number}`, 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Дата: ${data.invoiceDetails.date}`, 14, 30);
        doc.text(`Срок оплаты: ${data.invoiceDetails.dueDate}`, 14, 36);
        
        // Информация о продавце и покупателе
        doc.setFontSize(14);
        doc.text('Продавец:', 14, 50);
        doc.setFontSize(12);
        doc.text(data.seller.name, 14, 56);
        doc.text(data.seller.address, 14, 62);
        doc.text(`Телефон: ${data.seller.phone}`, 14, 68);
        doc.text(`Email: ${data.seller.email}`, 14, 74);
        
        doc.setFontSize(14);
        doc.text('Покупатель:', 105, 50);
        doc.setFontSize(12);
        doc.text(data.buyer.name, 105, 56);
        doc.text(data.buyer.address, 105, 62);
        doc.text(`Телефон: ${data.buyer.phone}`, 105, 68);
        doc.text(`Email: ${data.buyer.email}`, 105, 74);
        
        // Таблица с позициями
        doc.setFontSize(14);
        doc.text('Позиции счета:', 14, 90);
        
        const columns = [
            { header: 'Описание', dataKey: 'description' },
            { header: 'Количество', dataKey: 'quantity' },
            { header: 'Цена', dataKey: 'price' },
            { header: 'Сумма', dataKey: 'total' }
        ];
        
        const rows = data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price.toFixed(2),
            total: item.total.toFixed(2)
        }));
        
        doc.autoTable({
            startY: 95,
            head: [columns.map(col => col.header)],
            body: rows.map(row => columns.map(col => row[col.dataKey])),
            margin: { left: 14 },
            styles: { fontSize: 10 }
        });
        
        // Итоговые суммы
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Промежуточный итог: ${data.totals.subtotal.toFixed(2)}`, 140, finalY);
        doc.text(`Налог (${data.totals.taxRate}%): ${data.totals.taxAmount.toFixed(2)}`, 140, finalY + 6);
        doc.setFontSize(14);
        doc.text(`Общая сумма: ${data.totals.grandTotal.toFixed(2)}`, 140, finalY + 16);
        
        // Сохраняем PDF
        doc.save(`Счет_${data.invoiceDetails.number}.pdf`);
    }
});