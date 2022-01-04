input_type = input('choose input type:\n(1) x/y/z\n(2) x, y, z\n(3)[x/y/z, a/b/c, ...]\n__________: ')
if input_type == '1':
    work, distance, carry, creep_price = [int(opt) for opt in input('work_parts/distance/carry_parts/creep_price: ').split('/')]
elif input_type == '2':
    work = int(input('num of work parts: '))
    distance = int(input('distance from spawn to source: '))
    carry = int(input('num of carry parts: '))
    creep_price = int(input('creep price: '))
else:
    all_opts = [[int(i) for i in opts.split('/')] for opts in input('"work_parts/distance/carry_parts/creep_price, ... ": ').split(', ')] # work_parts/distance/carry_parts/creep_price, work_parts/distance/carry_parts/creep_price, work_parts/distance/carry_parts/creep_price

if input_type == '1' or input_type == '2':
    capacity = 50 * carry
    mining_speed = 2 * work
    print(
        f"""
        energy per tick: {capacity*mining_speed/(2*distance*mining_speed+capacity)}
        energy per life: {1500*capacity*mining_speed/(2*distance*mining_speed+capacity)}
        energy income: {1500*capacity*mining_speed/(2*distance*mining_speed+capacity)-creep_price}
        """)
else:
    for work, distance, carry, creep_price in all_opts:
        capacity = 50 * carry
        mining_speed = 2 * work
        print(
        f"""\n\n
        {work} {distance} {carry} {creep_price}:\n
        energy per tick: {capacity*mining_speed/(2*distance*mining_speed+capacity)}
        energy per life: {1500*capacity*mining_speed/(2*distance*mining_speed+capacity)}
        energy income: {1500*capacity*mining_speed/(2*distance*mining_speed+capacity)-creep_price}
        """)

# 1/100/19/1800, 2/100/17/1800, 3/100/15/1800, 4/100/13/1800, 5/100/11/1800, 6/100/9/1800, 7/100/7/1800, 8/100/5/1800, 9/100/3/1800