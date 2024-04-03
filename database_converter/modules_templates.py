DATABASE = """{{
"hulls": {{
    {hulls}
}},
"turrets": {{
    {turrets}
}},
"guns": {{
    {guns}
}}
}}
"""

HULL = """"{name}": {{
    "description": {description},
    "tier": {tier},
    "rarity": {rarity},
    "obtain": {obtain},
    "resources": {resources},
    "stats": {{
        "weight": {weight},
        "armor": {{
            "front": {armor_front},
            "back": {armor_back},
            "side": {armor_side}
        }},
        "speed": {{
            "acceleration": {speed_acceleration},
            "forward": {speed_forward},
            "backward": {speed_backward},
            "torque": {speed_torque},
            "rate": {speed_rate}
        }},
        "weaponry": {{
            "ammo_storage": {weapon_ammo_storage},
            "blowout": {weapon_blowout},
            "hull_aim": {weapon_hull_aim},
            "aps": {weapon_aps},
            "have_gun": {weapon_have_gun},
            "gun": {weapon_gun}
        }},
        "crew": {crew}
    }},
    "based_on": {based_on},
    "paired": {{
        "gun": {paired_gun},
        "turrret": {paired_turret}
    }}
}}
"""
HULL_GUN = """{{
                "reload_multiplier": {reload_multi},
                "reload_multiplier_caliber": {reload_multi_caliber},
                "limits": {{
                    "up": {limits_up},
                    "down": {limits_down},
                    "left": {limits_left},
                    "right": {limits_right}
                }}
            }}"""

TURRET = """"{name}": {{
    "description": {description},
    "tier": {tier},
    "rarity": {rarity},
    "obtain": {obtain},
    "resources": {resources},
    "stats": {{
        "weight": {weight},
        "armor": {{
            "front": {armor_front},
            "back": {armor_back},
            "side": {armor_side}
        }},
        "weaponry": {{
            "ammo_storage": {weapon_ammo_storage},
            "blowout": {weapon_blowout},
            "aps": {weapon_aps},
            "fcs": {weapon_fcs},
            "stabilizer": {weapon_stabilizer},
            "gun": {{
                "reload_multiplier": {weapon_gun_reload_multi},
                "reload_multiplier_caliber": {weapon_gun_reload_multi_caliber},
                "limits": {{
                    "up": {weapon_gun_limits_up},
                    "down": {weapon_gun_limits_down}
                }},
                "speed": {{
                    "vertical": {weapon_gun_speed_vertical},
                    "horizontal": {weapon_gun_speed_horizontal}
                }}
            }}
        }},
        "crew": {crew}
    }},
    "based_on": {based_on},
    "paired": {{
        "hull": {paired_hull},
        "gun": {paired_gun}
    }}
}}
"""

GUNS = """"{name}": {{
    "description": {description},
    "tier": {tier},
    "rarity": {rarity},
    "obtain": {obtain},
    "resources": {resources},
    "stats": {{
        "weight": {weight},
        "weaponry": {{
            "reload": {weapon_reload},
            "accuracy": {weapon_accuracy},
            "ammo_volume": {weapon_ammo_volume},
            "caliber:": {weapon_caliber},
            "ammunition": [{weapon_ammunition}]
        }}
    }},
    "based_on": {based_on},
    "paired": {{
        "hull": {paired_hull},
        "turret": {paired_turret}
    }}
}}
"""

AMMUNITION = """{{
    "type": {type},
    "penetration": {{
        "0": {penetration_0deg},
        "30": {penetration_30deg},
        "60": {penetration_60deg}
    }},
    "velocity": {velocity},
    "ricochet_angle": {ricochet_angle},
    "stats": {stats}
}}"""

AMMO_TYPES = {
    "AP": """{{}}""",
    "APHE": """{{
        "fuse_sensitive": {fuse_sensitive},
        "fuse_delay": {fuse_delay},
        "explosive_mass": {explosive_mass}
    }}""",
    "APDS": """{{}}""",
    "APFSDF": """{{}}""",
    "HEAT": """{{
        "fuse_radius": {fuse_radius},
        "arming_distance": {arming_distance}
    }}""",
    "ATGM": """{{
        "range": {range},
        "fuse_radius": {fuse_radius},
        "arming_distance": {arming_distance}
    }}""",
    "HE": """{{
        "explosive_mass": {explosive_mass},
        "fuse_radius": {fuse_radius},
        "arming_distance": {arming_distance}
    }}""",
    "HESH": """{{
        "explosive_mass": {explosive_mass}
    }}"""
}