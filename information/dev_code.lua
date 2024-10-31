--faux (gun caliber penalty)
local gc, rm = 75, 1.0; 
local rm2 = rm;

if rm <= 1 then 
    rm2 = 1 
end 

print(
    math.clamp(
        rm*2/(gc^(1/3)-2.27), 
        0, 
        math.clamp(
            rm2, 
            0, 
            1+math.clamp(
                math.sqrt(gc) -5.91, 
                0, 
                rm2)
            )
        )
    );

--qolop
function getPenAtDist(penetration, distance, caliber, shellSpeed)
    local pen = penetration
    local step = 1/60
    local currentDist = 0
    
    while currentDist < (distance * 3.57) do
        currentDist += (shellSpeed * 3.57) * step
        pen -= pen * currentDist / (200 / step * caliber)
    end
    
    return pen
end

--qolop: its dependent on armour thickness and kinetic shell type. this is the actual caclculation used.

local ricochetAngle = shellFolder.RicochetAngle.Value
local index = 1

if not (shellFolder.Name == "HEAT" or shellFolder.Name == "ATGM") then --@Makar-Ts: HEAT and ATGM are not normalize
    local hitAngle = (math.acos(rayDir:Dot(-surfaceNormal)))
    local normalThickness = (hitPositionT - hit).Magnitude*280.112/mult

    if shellFolder.Name == "APFSDS" then
        local index60 = (shellFolder:FindFirstChild("Penetration60").Value*2)/shellFolder.Penetration.Value
        
        index = getAPFSDSIndex(angleDeg, index60, normalThickness, shellFolder.Penetration.Value)^-1
    else -- other kinetic rounds
        index = getOtherIndex(ricochetAngle, angleDeg, normalThickness, shellFolder.Penetration.Value)^-1
    end

    local minDeflectionAngle = 10 --@Makar-Ts: min "normalize angle" i think 
    if angleDeg > minDeflectionAngle then
        local refDir = math.sqrt(1-index^2*(1-(-surfaceNormal:Dot(rayDir))^2))*-surfaceNormal+index*(rayDir-(-surfaceNormal:Dot(rayDir))*-surfaceNormal)
        rayDir = refDir
    end
end

--qolop: this is the basic calculation I do for the statcards
if v.Name == "AP" or v.Name == "APHE" or v.Name == "APDS" then
    pen30Frame:FindFirstChild("val").Text = math.floor(v.Penetration.Value * math.cos(math.asin(math.sin(math.rad(v.RicochetAngle.Value))^-1*math.sin(math.rad(30))))+0.5) .. "mm"
    pen60Frame:FindFirstChild("val").Text = math.floor(v.Penetration.Value * math.cos(math.asin(math.sin(math.rad(v.RicochetAngle.Value))^-1*math.sin(math.rad(60))))+0.5) .. "mm"
elseif v.Name == "HEAT" or v.Name == "ATGM" then
    pen30Frame:FindFirstChild("val").Text = math.floor(v.Penetration.Value * math.cos(math.rad(30)) + 0.5) .. "mm"
    pen60Frame:FindFirstChild("val").Text = math.floor(v.Penetration.Value * math.cos(math.rad(60)) + 0.5) .. "mm"
elseif v.Name == "HE" or v.Name == "HESH" then
    pen30Frame:FindFirstChild("val").Text = v.Penetration.Value .. "mm"
    pen60Frame:FindFirstChild("val").Text = v.Penetration.Value .. "mm"
elseif v.Name == "APFSDS" then
    pen30Frame:FindFirstChild("val").Text = math.floor(v.Penetration.Value * math.cos(math.asin((v.Penetration.Value/v.Penetration60.Value/2)*math.sin(math.rad(30))))+0.5) .. "mm"
    pen60Frame:FindFirstChild("val").Text = v.Penetration60.Value .. "mm"
else
    print("not supported shell type")
end