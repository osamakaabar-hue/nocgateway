import re

with open('src/data.ts', 'r') as f:
    content = f.read()

blocks = content.split('id: "claim-')

target_paid = 60000000
original_paid = 0

for b in blocks[1:]:
    if 'authorized_for_payment' in b:
        inv_m = re.search(r'invoiceAmount:\s*(\d+)', b)
        if inv_m:
            original_paid += int(inv_m.group(1))

print('Orig Paid:', original_paid)

auth_count = sum(1 for b in blocks[1:] if 'authorized_for_payment' in b)
auth_seen = 0
paid_remaining = target_paid
final_blocks = [blocks[0]]

for b in blocks[1:]:
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

print('Updated src/data.ts to exactly 60M paid.')
