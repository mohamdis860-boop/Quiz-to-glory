import { supabase } from "../lib/supabase";
import type { Player } from "../types";

export async function fetchAllPlayers(): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*");

    if (error) {
      console.error("Error fetching players from Supabase:", error);
      return [];
    }

    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      position: row.position,
      rating: row.rating,
      rarity: row.rarity,
      club: row.club,
      nationality: row.nationality,
      photoUrl: row.photo_url,
      stats: {
        pace: row.pace,
        shooting: row.shooting,
        passing: row.passing,
        dribbling: row.dribbling,
        defending: row.defending,
        physical: row.physical,
      }
    }));
  } catch (error) {
    console.error("Critical Error:", error);
    return []; // لو حصل كراش في الاتصال، رجع مصفوفة فاضية عشان اللعبة تكمل
  }
}