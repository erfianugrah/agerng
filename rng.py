import random
import json
import os
import sys

civilizations = [
    "Abbasid Dynasty", "Ayyubids", "Byzantines", "Chinese", "Delhi Sultanate",
    "English", "French", "Holy Roman Empire", "Japanese", "Jeanne d'Arc",
    "Malians", "Mongols", "Order of the Dragon", "Ottomans", "Rus",
    "Zhu Xi's Legacy"
]

age_up_options = {
    "Abbasid Dynasty": ["Culture Wing", "Economic Wing", "Military Wing", "Trade Wing"],
    "Ayyubids": ["Culture Wing", "Economic Wing", "Military Wing", "Trade Wing"],
    "Byzantines": {
        "II": ["Grand Winery", "Imperial Hippodrome"],
        "III": ["Golden Horn Tower", "Cistern of the First Hill"],
        "IV": ["Foreign Engineering Company", "Palatine School"]
    },
    "Chinese": {
        "II": ["Barbican of the Sun", "Imperial Academy"],
        "III": ["Imperial Palace", "Astronomical Clocktower"],
        "IV": ["Great Wall Gatehouse", "Spirit Way"]
    },
    "Delhi Sultanate": {
        "II": ["Tower of Victory", "Dome of the Faith"],
        "III": ["Compound of the Defender", "House of Learning"],
        "IV": ["Hisar Academy", "Palace of the Sultan"]
    },
    "English": {
        "II": ["Council Hall", "Abbey of Kings"],
        "III": ["King's Palace", "The White Tower"],
        "IV": ["Berkshire Palace", "Wynguard Palace"]
    },
    "French": {
        "II": ["Chamber of Commerce", "School of Cavalry"],
        "III": ["Royal Institute", "Guild Hall"],
        "IV": ["Red Palace", "College of Artillery"]
    },
    "Holy Roman Empire": {
        "II": ["Meinwerk Palace", "Aachen Chapel"],
        "III": ["Regnitz Cathedral", "Burgrave Palace"],
        "IV": ["Elzbach Palace", "Palace of Swabia"]
    },
    "Japanese": {
        "II": ["Koka Township", "Kura Storehouse"],
        "III": ["Floating Gate", "Temple of Equality"],
        "IV": ["Castle of the Crow", "Tanegashima Gunsmith"]
    },
    "Jeanne d'Arc": {
        "II": ["Chamber of Commerce", "School of Cavalry"],
        "III": ["Royal Institute", "Guild Hall"],
        "IV": ["Red Palace", "College of Artillery"]
    },
    "Malians": {
        "II": ["Saharan Trade Network", "Mansa Quarry"],
        "III": ["Grand Fulani Corral", "Farimba Garrison"],
        "IV": ["Griot Bara", "Fort of the Huntress"]
    },
    "Mongols": {
        "II": ["Deer Stones", "The Silver Tree"],
        "III": ["Kurultai", "Steppe Redoubt"],
        "IV": ["The White Stupa", "Khaganate Palace"]
    },
    "Order of the Dragon": {
        "II": ["Chamber of Commerce", "School of Cavalry"],
        "III": ["Royal Institute", "Guild Hall"],
        "IV": ["Red Palace", "College of Artillery"]
    },
    "Ottomans": {
        "II": ["Twin Minaret Medrese", "Sultanhani Trade Network"],
        "III": ["Istanbul Imperial Palace", "Mehmed Imperial Armory"],
        "IV": ["Istanbul Observatory", "Sea Gate Castle"]
    },
    "Rus": {
        "II": ["Kremlin", "The Golden Gate"],
        "III": ["High Trade House", "Abbey of the Trinity"],
        "IV": ["Spasskaya Tower", "High Armory"]
    },
    "Zhu Xi's Legacy": {
        "II": ["Meditation Gardens", "Jiangnan Tower"],
        "III": ["Mount Lu Academy", "Shaolin Monastery"],
        "IV": ["Zhu Xi's Library", "Temple of the Sun"]
    }
}

ayyubid_bonuses = {
    "Culture Wing": {
        "Advancement": {
            "II": "Age up takes 96s, costs 225 food, 125 gold",
            "III": "Age up takes 96s, costs 900 food, 500 gold",
            "IV": "Age up takes 96s, costs 1500 food, 750 gold"
        },
        "Logistics": {
            "II": "Grants 2 Dervishes, Dervish Mass Heal rate +25%",
            "III": "Grants 3 Dervishes, Dervish Mass Heal rate +30%",
            "IV": "Grants 4 Dervishes, Dervish Mass Heal rate +30% and permanent"
        }
    },
    "Economic Wing": {
        "Growth": {
            "II": "Grants 3 Villagers, Orchards +50 food",
            "III": "Grants 7 Villagers, Orchards +100 food",
            "IV": "Grants 10 Villagers, Villagers +10% work rate"
        },
        "Industry": {
            "II": "Grants 300 wood",
            "III": "Grants 1,000 wood",
            "IV": "Grants 2,500 wood"
        }
    },
    "Military Wing": {
        "Master Smiths": {
            "II": "Grants Feudal Age Blacksmith attack and armor technologies for free",
            "III": "Grants Castle Age Blacksmith attack and armor technologies for free (requires Feudal Age technologies)",
            "IV": "Grants Imperial Age Blacksmith attack and armor technologies for free (requires Castle Age technologies)"
        },
        "Reinforcement": {
            "II": "Grants 1 Desert Raider after 15 seconds, then 1 more every 2 minutes. Cavalry can construct siege",
            "III": "Grants 3 Desert Raiders after 15 seconds, then 3 more every 2 minutes. Cavalry can construct siege",
            "IV": "Grants 7 Desert Raiders after 15 seconds, then 7 more every 2 minutes. Cavalry can construct siege"
        }
    },
    "Trade Wing": {
        "Advisors": {
            "II": "Grants 3 Atabegs",
            "III": "Grants 5 Atabegs",
            "IV": "Grants 7 Atabegs"
        },
        "Bazaar": {
            "II": "Grants a trade caravan every 3 minutes",
            "III": "Grants a trade caravan with improved trades every 3 minutes",
            "IV": "Grants a trade caravan with further improved trades every 3 minutes"
        }
    }
}

def generate_random_civ():
    civ = random.choice(civilizations)
    age_ups = {}
    
    if civ in ["Abbasid Dynasty", "Ayyubids"]:
        available_wings = age_up_options[civ].copy()
        for age in ["II", "III"]:
            wing = random.choice(available_wings)
            available_wings.remove(wing)
            if civ == "Abbasid Dynasty":
                age_ups[age] = wing
            else:  # Ayyubids
                bonus_type = random.choice(list(ayyubid_bonuses[wing].keys()))
                age_ups[age] = f"{wing} - {bonus_type}: {ayyubid_bonuses[wing][bonus_type][age]}"
        
        # For Imperial Age, choose all remaining wings
        if civ == "Abbasid Dynasty":
            age_ups["IV"] = " and ".join(available_wings)
        else:  # Ayyubids
            imperial_choices = []
            for wing in available_wings:
                bonus_type = random.choice(list(ayyubid_bonuses[wing].keys()))
                imperial_choices.append(f"{wing} - {bonus_type}: {ayyubid_bonuses[wing][bonus_type]['IV']}")
            age_ups["IV"] = " and ".join(imperial_choices)
    else:
        for age in ["II", "III", "IV"]:
            age_ups[age] = random.choice(age_up_options[civ][age])
    
    return {"civilization": civ, "age_ups": age_ups}

def print_civ_info(result):
    print(f"Random Civilization: {result['civilization']}")
    print("\nAge-up choices:")
    for age, choice in result['age_ups'].items():
        print(f"Age {age}: {choice}")

def save_to_file(result):
    # Generate a unique filename in the current directory
    i = 1
    while os.path.exists(f'random_civ_{i}.json'):
        i += 1
    filename = f'random_civ_{i}.json'

    # Write the result to a JSON file
    with open(filename, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"\nResults saved to {filename}")

def main():
    print("Age of Empires IV Random Civilization Generator")
    print("----------------------------------------------")
    
    while True:
        result = generate_random_civ()
        
        # Print results to console
        print_civ_info(result)
        
        # Save results to file
        save_to_file(result)
        
        play_again = input("\nGenerate another civilization? (y/n): ").lower()
        if play_again != 'y':
            break

    print("Thanks for using the AoE IV Random Civilization Generator!")

if __name__ == "__main__":
    main()
