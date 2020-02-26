use wasm_bindgen::prelude::*;

#[derive(Clone,PartialEq)]
enum Op{
    Add,
    Minus,
    Multiply,
    Divide,
    Concat,
    // Dot,
}

#[derive(Clone)]
enum EquationDisplay {
    Numeric(f32),
    Equation(String),
}

impl EquationDisplay {
    fn is_numeric(&self)->bool{
        match self{
            EquationDisplay::Numeric(_)=>true,
            EquationDisplay::Equation(_)=>false,
        }
    }
}

impl std::fmt::Display for EquationDisplay {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EquationDisplay::Numeric(n) => f.write_fmt(format_args!("{}",n)),
            EquationDisplay::Equation(n) => f.write_fmt(format_args!("({})",n)),
        }
    }
}


#[derive(Clone)]
struct Combinations {
    pub nums: Vec<f32>,
    pub display: Vec<EquationDisplay>,
}

#[wasm_bindgen]
pub fn iiyokoiyo_calculator(num: f32) -> Option<String> {
    let nums = [1f32,1f32,4f32,5f32,1f32,4f32];

    get_permutations(Combinations{
        nums: nums.to_vec(),
        display: nums.into_iter().map(|x| EquationDisplay::Numeric(*x) ).collect(),
    }, num).map(|x| {
        format!("{}", x.display.first().unwrap())
    })
}

const ALL_OPS:[Op;5] = [Op::Add,Op::Minus,Op::Multiply,Op::Divide,Op::Concat];

fn get_permutations(comb: Combinations, target: f32) -> Option<Combinations> {
    if comb.nums.len() == 1 {
        if comb.nums[0] == target {
            return Some(comb);
        }
    }
    for i in 0..comb.nums.len()-1 {
        for op in ALL_OPS.into_iter() {
            let mut new_nums = comb.nums.clone();
            let mut new_display = comb.display.clone();
            let left = comb.nums[i];
            let right = comb.nums[i+1];
            let new_num;
            let new_display_item;
            if right == 0f32 && *op == Op::Divide {
                continue;
            }
            if *op == Op::Concat && (!new_display[i].is_numeric() || !new_display[i+1].is_numeric()) {
                continue;
            }
            // if *op == Op::Dot {
            //     if !new_display[i].is_numeric() || !new_display[i+1].is_numeric(){
            //         continue
            //     }
            //     if let EquationDisplay::Numeric(num) = new_display[i] {
            //         if num.fract() != 0f32{
            //             continue;
            //         }
            //     }
            // }
            match op {
                Op::Add => {
                    new_display_item = EquationDisplay::Equation(format!("{}+{}", new_display[i], new_display[i+1]));
                    new_num = left + right;
                },
                Op::Minus => {
                    new_display_item = EquationDisplay::Equation(format!("{}-{}", new_display[i], new_display[i+1]));
                    new_num = left - right
                },
                Op::Multiply => {
                    new_display_item = EquationDisplay::Equation(format!("{}*{}", new_display[i], new_display[i+1]));
                    new_num = left * right
                }
                Op::Divide => {
                    new_display_item = EquationDisplay::Equation(format!("{}/{}", new_display[i], new_display[i+1]));
                    new_num = left / right
                },
                Op::Concat => {
                    new_display_item = EquationDisplay::Numeric(left * 10f32 + right);
                    new_num = left * 10f32 + right
                },
                // Op::Dot => {
                //     new_display_item = EquationDisplay::Numeric(left + right / right.log10() );
                //     new_num = left + right / right.log10()
                // }
            };
            new_nums.splice(i..i+2, [new_num].iter().cloned());
            new_display.splice(i..i+2, [new_display_item].iter().cloned());
            let child_res = get_permutations(Combinations{
                nums: new_nums,
                display: new_display
            }, target);
            if child_res.is_some() {
                return child_res;
            }
        }
    }
    None
}