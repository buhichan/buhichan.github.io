
vec2 complexExp(vec2 z){
    return exp(z.x) * vec2(
        cos(z.y),
        sin(z.y)
    );
}

vec2 polarForm(vec2 z){
    float rad = atan(z.y,z.x); //atan is -pi ~ pi
    float l = length(z);
    return vec2(l,rad);
}

vec2 complexPow(vec2 z, float power){
    vec2 pz = polarForm(z);
    return pow(pz.x, power) * vec2(
        cos(pz.y * power),
        sin(pz.y * power)
    );
}

vec2 complexDiv(vec2 z1, vec2 z2){
    vec2 pz1 = polarForm(z1);
    vec2 pz2 = polarForm(z2);
    return pz1.x / pz2.x * vec2(
        cos(pz1.y - pz2.y),
        sin(pz1.y - pz2.y)
    );
}