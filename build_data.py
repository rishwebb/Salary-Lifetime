import csv
import json

data = {
    'summary': {
        'gross_earned': 47991.85,
        'gambling_deposits': 17000.00,
        'gambling_withdrawals': 11525.00,
        'gambling_net_loss': -5475.00,
        'net_pocket_balance': 42516.85,
        'total_cash_inflow': 59516.85,
        'total_outflow': 17000.00
    },
    'categories': [
        {
            'id': 'agency',
            'name': 'Agency Salary',
            'color': '#dcf836',
            'amount': 32000.00,
            'tx_count': 4,
            'share': 66.68,
            'icon': 'briefcase'
        },
        {
            'id': 'college',
            'name': 'College Freelance',
            'color': '#b4f044',
            'amount': 10919.00,
            'tx_count': 12,
            'share': 22.75,
            'icon': 'graduation'
        },
        {
            'id': 'digital',
            'name': 'Digital Products',
            'color': '#f2f059',
            'amount': 4413.29,
            'tx_count': 33,
            'share': 9.20,
            'icon': 'shopping-bag'
        },
        {
            'id': 'razorpay',
            'name': 'Razorpay Payments',
            'color': '#8ef57e',
            'amount': 569.56,
            'tx_count': 51,
            'share': 1.19,
            'icon': 'credit-card'
        },
        {
            'id': 'review',
            'name': 'Review Work',
            'color': '#d7f283',
            'amount': 90.00,
            'tx_count': 1,
            'share': 0.19,
            'icon': 'star'
        },
        {
            'id': 'gambling',
            'name': 'Gambling Portfolio',
            'color': '#ff5f5f',
            'amount': -5475.00,
            'tx_count': 61,
            'share': 0.0,
            'icon': 'dice'
        }
    ],
    'transactions': []
}

month_numbers = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
}

# 1. Agency
with open('freelance_agency_salary.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        mnum = month_numbers.get(r['Month'], '06')
        data['transactions'].append({
            'source': 'Agency Salary',
            'category_id': 'agency',
            'date': f"{r['Month']} {r['Year']}",
            'iso_date': f"{r['Year']}-{mnum}-01",
            'time': '12:00 PM',
            'month': r['Month'],
            'year': int(r['Year']),
            'amount': float(r['Amount_INR']),
            'type': 'Credit',
            'status': 'Completed',
            'details': r['Description']
        })

# 2. College Freelance
with open('freelance_college_work.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        data['transactions'].append({
            'source': 'College Freelance',
            'category_id': 'college',
            'date': r['Date'],
            'iso_date': r['Date'],
            'time': r['Time'],
            'month': r['Month'],
            'year': int(r['Year']),
            'amount': float(r['Amount']),
            'type': 'Credit',
            'status': 'Completed',
            'details': 'Student Freelance Project Payout'
        })

# 3. Digital Products
with open('digital_product_sale_revenue.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        mnum = month_numbers.get(r['Month'], '01')
        day = r['Date'].split('-')[0].zfill(2)
        data['transactions'].append({
            'source': 'Digital Products',
            'category_id': 'digital',
            'date': r['Date'],
            'iso_date': f"{r['Year']}-{mnum}-{day}",
            'time': r['Time'],
            'month': r['Month'],
            'year': int(r['Year']),
            'amount': float(r['Amount_INR']),
            'type': 'Credit',
            'status': r['Status'],
            'details': f"{r['Transactions_Count']} sale(s) completed"
        })

# 4. Razorpay
with open('razorpay_earnings.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        mnum = month_numbers.get(r['Month'], '04')
        day = r['Date'].split('-')[0].zfill(2)
        data['transactions'].append({
            'source': 'Razorpay',
            'category_id': 'razorpay',
            'date': r['Date'],
            'iso_date': f"{r['Year']}-{mnum}-{day}",
            'time': r['Time'],
            'month': r['Month'],
            'year': int(r['Year']),
            'amount': float(r['Amount_INR']),
            'type': 'Credit',
            'status': 'Completed',
            'details': 'Razorpay Payment Gateway Capture'
        })

# 5. Review Work
data['transactions'].append({
    'source': 'Review Work',
    'category_id': 'review',
    'date': 'June 2025',
    'iso_date': '2025-06-15',
    'time': '10:00 AM',
    'month': 'June',
    'year': 2025,
    'amount': 90.00,
    'type': 'Credit',
    'status': 'Completed',
    'details': 'Initial Product Review Bounty'
})

# 6. Gambling
with open('gambling.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        mnum = month_numbers.get(r['Month'], '07')
        day = r['Date'].split('-')[0].zfill(2)
        data['transactions'].append({
            'source': 'Gambling Portfolio',
            'category_id': 'gambling',
            'date': r['Date'],
            'iso_date': f"{r['Year']}-{mnum}-{day}",
            'time': r['Time'],
            'month': r['Month'],
            'year': int(r['Year']),
            'amount': float(r['Amount_INR']),
            'type': r['Type'],
            'status': r['Status'],
            'details': r['Note']
        })

timeline_order = [
    ('June', 2025), ('July', 2025), ('August', 2025), ('October', 2025),
    ('January', 2026), ('February', 2026), ('March', 2026), ('April', 2026), ('May', 2026),
    ('June', 2026), ('July', 2026), ('August', 2026), ('September', 2026)
]

monthly_data = []
for m, y in timeline_order:
    txs = [t for t in data['transactions'] if t['month'] == m and t['year'] == y]
    earned = sum(t['amount'] for t in txs if t['category_id'] != 'gambling' and t['type'] == 'Credit')
    g_dep = sum(t['amount'] for t in txs if t['category_id'] == 'gambling' and t['type'] == 'Deposit' and t['status'] == 'Completed')
    g_wth = sum(abs(t['amount']) for t in txs if t['category_id'] == 'gambling' and t['type'] == 'Withdrawal' and t['status'] == 'Completed')
    g_net = g_wth - g_dep
    net = earned + g_net
    monthly_data.append({
        'month': m,
        'year': y,
        'label': f"{m} {y}",
        'short_label': f"{m[:3]} '{str(y)[2:]}",
        'earned': round(earned, 2),
        'gambling_net': round(g_net, 2),
        'gambling_deposits': round(g_dep, 2),
        'gambling_withdrawals': round(g_wth, 2),
        'net_balance': round(net, 2),
        'tx_count': len(txs),
        'categories_present': list(set(t['source'] for t in txs))
    })

data['monthly_timeline'] = monthly_data

with open('data.js', 'w', encoding='utf-8') as f:
    f.write('window.PORTFOLIO_DATA = ' + json.dumps(data, indent=2) + ';\n')

summary_export = {
    'currency': 'INR',
    'totals': data['summary'],
    'categories': data['categories'],
    'monthly_timeline': monthly_data
}
with open('master_financial_summary.json', 'w', encoding='utf-8') as f:
    json.dump(summary_export, f, indent=2)

print(f"data.js and master_financial_summary.json regenerated with {len(data['transactions'])} transactions and {len(monthly_data)} months.")
