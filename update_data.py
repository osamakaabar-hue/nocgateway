import re
import math

with open('src/data.ts', 'r') as f:
    content = f.read()

# First, revert claim-1 back to its original value if needed
content = re.sub(r'claimedValue: "\$1,078,715,000"', 'claimedValue: "$1,250,000"', content)
content = re.sub(r'numericValue: 1078715000', 'numericValue: 1250000', content)
content = re.sub(r'invoiceAmount: 674196875', 'invoiceAmount: 781250', content)

# Now extract all numericValues
blocks = content.split('id: "claim-')

target_budget = 1119000000
target_paid = 50000000

# Get original sums
original_budget = 0
original_paid = 0

for b in blocks[1:]:
    val_m = re.search(r'numericValue:\s*(\d+)', b)
    if val_m:
        original_budget += int(val_m.group(1))
    
    if 'authorized_for_payment' in b:
        inv_m = re.search(r'invoiceAmount:\s*(\d+)', b)
        if inv_m:
            original_paid += int(inv_m.group(1))

print('Orig Budget:', original_budget)
print('Orig Paid:', original_paid)

# Let's do it in two passes
auth_count = sum(1 for b in blocks[1:] if 'authorized_for_payment' in b)
auth_seen = 0

budget_remaining = target_budget
paid_remaining = target_paid
final_blocks = [blocks[0]]

for i, b in enumerate(blocks[1:]):
    is_last_budget = (i == len(blocks[1:]) - 1)
    
    val_m = re.search(r'numericValue:\s*(\d+)', b)
    orig_val = int(val_m.group(1)) if val_m else 0
    
    if orig_val > 0:
        new_val = int(round((orig_val / original_budget) * target_budget))
        if is_last_budget:
            new_val = budget_remaining
        budget_remaining -= new_val
        
        formatted_val = f'${new_val:,.0f}'
        b = re.sub(r'numericValue:\s*\d+', f'numericValue: {new_val}', b)
        b = re.sub(r'claimedValue:\s*"[^"]+"', f'claimedValue: "{formatted_val}"', b)
        
    if 'authorized_for_payment' in b:
        auth_seen += 1
        inv_m = re.search(r'invoiceAmount:\s*(\d+)', b)
        if inv_m:
            orig_inv = int(inv_m.group(1))
            new_inv = int(round((orig_inv / original_paid) * target_paid))
            if auth_seen == auth_count:
                new_inv = paid_remaining
            paid_remaining -= new_inv
            b = re.sub(r'invoiceAmount:\s*\d+', f'invoiceAmount: {new_inv}', b)
            
    final_blocks.append('id: "claim-' + b)

with open('src/data.ts', 'w') as f:
    f.write(''.join(final_blocks))

print('Updated src/data.ts')
