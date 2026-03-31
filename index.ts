import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = "BLiT_0ASL26LXBZRplvgsjn6HqB6cv5eaJRhYGs2xO9_WN5lvNWHYiPfN3stL7ryokNfyzQ8vBSyAIDbkmYvZts";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = "mailto:kai.padden11@gmail.com";

// ─── PAYOUT TABLE (Masters 2026) ─────────────────────────
const PAYOUT: Record<number, number[]> = {
  1: [4200000,3234000,2632000,2226000,1948800,1750000,1600500,1481812,1384833,1303050],
  2: [2268000,1848000,1568000,1386000,1260000,1167250,1093500,1032938,981167,935550],
  3: [1428000,1218000,1092000,1008000,947100,897750,856500,820312,787500,757050],
  4: [1008000,924000,868000,826875,791700,761250,733500,707438,682500,658350],
  5: [840000,798000,766500,737625,711900,687750,664500,641812,619500,597450],
  6: [756000,729750,703500,679875,657300,635250,613500,591938,570500,551250],
  7: [703500,677250,654500,632625,611100,589750,568500,547312,528500,511350],
  8: [651000,630000,609000,588000,567000,546000,525000,506625,490000,474600],
  9: [609000,588000,567000,546000,525000,504000,486000,469875,455000,441000],
  10: [567000,546000,525000,504000,483000,465500,450000,435750,422333,409500],
  11: [525000,504000,483000,462000,445200,430500,417000,404250,392000,380100],
  12: [483000,462000,441000,425250,411600,399000,387000,375375,364000,352800],
  13: [441000,420000,406000,393750,382200,371000,360000,349125,338333,328020],
  14: [399000,388500,378000,367500,357000,346500,336000,325500,315467,305760],
  15: [378000,367500,357000,346500,336000,325500,315000,305025,295400,286020],
  16: [357000,346500,336000,325500,315000,304500,294600,285075,275800,266700],
  17: [336000,325500,315000,304500,294000,284200,274800,265650,256667,247800],
  18: [315000,304500,294000,283500,273840,264600,255600,246750,238000,230370],
  19: [294000,283500,273000,263550,254520,245700,237000,228375,220967,214410],
  20: [273000,262500,253400,244650,236040,227500,219000,211838,205567,199920],
  21: [252000,243600,235200,226800,218400,210000,203100,197138,191800,186900],
  22: [235200,226800,218400,210000,201600,194950,189300,184275,179667,175350],
  23: [218400,210000,201600,193200,186900,181650,177000,172725,168700,164850],
  24: [201600,193200,184800,179025,174300,170100,166200,162488,158900,155400],
  25: [184800,176400,171500,167475,163800,160300,156900,153562,150267,147105],
  26: [168000,164850,161700,158550,155400,152250,149100,145950,142917,139965],
  27: [161700,158550,155400,152250,149100,145950,142800,139781,136850,133980],
  28: [155400,152250,149100,145950,142800,139650,136650,133744,130900,128100],
  29: [149100,145950,142800,139650,136500,133525,130650,127838,125067,122430],
  30: [142800,139650,136500,133350,130410,127575,124800,122062,119467,116970],
  31: [136500,133350,130200,127312,124530,121800,119100,116550,114100,111720],
  32: [130200,127050,124250,121538,118860,116200,113700,111300,108967,106680],
  33: [123900,121275,118650,116025,113400,110950,108600,106312,104067,101850],
  34: [118650,116025,113400,110775,108360,106050,103800,101588,99400,97230],
  35: [113400,110775,108150,105788,103530,101325,99150,96994,94850,92715],
  36: [108150,105525,103250,101062,98910,96775,94650,92531,90417,88305],
  37: [102900,100800,98700,96600,94500,92400,90300,88200,86100,84000],
  38: [98700,96600,94500,92400,90300,88200,86100,84000,81900,79800],
  39: [94500,92400,90300,88200,86100,84000,81900,79800,77700,75684],
  40: [90300,88200,86100,84000,81900,79800,77700,75600,73593,71694],
  41: [86100,84000,81900,79800,77700,75600,73500,71505,69627,67956],
  42: [81900,79800,77700,75600,73500,71400,69420,67568,65940,59346],
  43: [77700,75600,73500,71400,69300,67340,65520,63945,56840,51156],
  44: [73500,71400,69300,67200,65268,63490,61980,54232,48207,43386],
  45: [69300,67200,65100,63210,61488,60060,51480,45045,40040,36036],
  46: [65100,63000,61180,59535,58212,48510,41580,36382,32340,29106],
  47: [60900,59220,57680,56490,45192,37660,32280,28245,25107,22596],
  48: [57540,56070,55020,41265,33012,27510,23580,20632,18340,16506],
  49: [54600,53760,35840,26880,21504,17920,15360,13440,11947,10752],
  50: [52920,26460,17640,13230,10584,8820,7560,6615,5880,5292],
};

function getPayout(pos: number, tied: number): number {
  if (!pos || pos >= 999 || pos > 50) return 0;
  const row = PAYOUT[pos];
  if (!row) return 0;
  // Row is 0-indexed: index 0 = solo, index 1 = 2-way tie, etc.
  const col = Math.min((tied || 1) - 1, row.length - 1);
  return row[col] || 0;
}

// ─── VAPID ────────────────────────────────────────────────
function b64url(b: string): Uint8Array {
  const pad = "=".repeat((4 - b.length % 4) % 4);
  const raw = atob((b+pad).replace(/-/g,"+").replace(/_/g,"/"));
  return new Uint8Array([...raw].map(c=>c.charCodeAt(0)));
}
async function vapidHeaders(audience: string) {
  const now = Math.floor(Date.now()/1000);
  const enc = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
  const h = enc({typ:"JWT",alg:"ES256"});
  const p = enc({aud:audience,exp:now+43200,sub:VAPID_SUBJECT});
  const key = await crypto.subtle.importKey("raw",b64url(VAPID_PRIVATE_KEY),{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
  const sig = await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,new TextEncoder().encode(`${h}.${p}`));
  const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
  return { "Authorization":`vapid t=${h}.${p}.${s},k=${VAPID_PUBLIC_KEY}`, "Content-Type":"application/octet-stream", "TTL":"60" };
}
async function sendPush(sub: any, payload: object): Promise<boolean> {
  try {
    const u = new URL(sub.endpoint);
    const headers = await vapidHeaders(`${u.protocol}//${u.host}`);
    const r = await fetch(sub.endpoint,{method:"POST",headers,body:new TextEncoder().encode(JSON.stringify(payload))});
    return r.ok || r.status===201;
  } catch(e) { console.error(e); return false; }
}

// ─── Helpers ──────────────────────────────────────────────
function numPos(p: string): number {
  if (!p || p==="–" || p==="WD" || p==="MC") return 9999;
  return parseInt(p.replace(/^T/,"")) || 9999;
}
function checkMilestone(curr: number, prev: number): {m:number; entered:boolean} | null {
  for (const m of [1,5,10]) {
    if (curr<=m && prev>m) return {m,entered:true};
    if (curr>m && prev<=m) return {m,entered:false};
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────
Deno.serve(async () => {
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Fetch ESPN
    const espn = await (await fetch("https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard")).json();
    const competitors = espn?.events?.[0]?.competitions?.[0]?.competitors || [];
    if (!competitors.length) return new Response(JSON.stringify({sent:0,reason:"no ESPN"}),{status:200});
    const tournament = espn?.events?.[0]?.name || "Masters 2026";

    // Build golf scores: name -> { pos, tiedCount }
    type GolferScore = { pos: string; tiedCount: number };
    const currGolf: Record<string, GolferScore> = {};

    // Group by position to calculate tie counts
    const byPos: Record<string, string[]> = {};
    for (const c of competitors) {
      const name = c.athlete?.displayName || "";
      const pos = c.status?.position?.displayName || "–";
      if (!name) continue;
      if (!byPos[pos]) byPos[pos] = [];
      byPos[pos].push(name);
    }
    for (const [pos, names] of Object.entries(byPos)) {
      for (const name of names) {
        currGolf[name] = { pos, tiedCount: names.length };
      }
    }

    // Load snapshot
    const { data: snap } = await sb.from("score_snapshots").select("snapshots").eq("tournament", tournament).single();
    const prevGolf: Record<string, GolferScore> = snap?.snapshots?.golf || {};
    const prevPoolPos: Record<string, number> = snap?.snapshots?.pool || {};
    const hasSnap = Object.keys(prevGolf).length > 0;

    // Load all data
    const [{ data: teams }, { data: golferRows }, { data: subs }, { data: prefs }] = await Promise.all([
      sb.from("teams").select("id,name,golfers,owner").eq("paid", true),
      sb.from("golfers").select("id,name"),
      sb.from("push_subscriptions").select("*"),
      sb.from("push_notification_prefs").select("*").eq("enabled", true),
    ]);

    // Build lookup maps
    const golferMap: Record<number, string> = {};
    for (const g of (golferRows||[])) golferMap[g.id] = g.name;

    const subMap: Record<string, any> = {};
    for (const s of (subs||[])) subMap[s.user_email] = s.subscription;

    const enabledPrefs = new Set((prefs||[]).map((p:any)=>`${p.user_email}:${p.team_id}`));

    // Calculate current pool earnings per team
    const currPoolEarnings: Record<string, number> = {};
    for (const team of (teams||[])) {
      let total = 0;
      for (const gId of (team.golfers||[])) {
        const name = golferMap[gId];
        if (!name) continue;
        // Find ESPN name match by last name
        const espnName = Object.keys(currGolf).find(n =>
          n.toLowerCase().includes(name.split(" ").pop()!.toLowerCase()) ||
          name.toLowerCase().includes(n.split(" ").pop()!.toLowerCase())
        );
        if (!espnName) continue;
        const { pos, tiedCount } = currGolf[espnName];
        total += getPayout(numPos(pos), tiedCount);
      }
      currPoolEarnings[team.id] = total;
    }

    // Rank teams by earnings
    const sortedTeams = [...(teams||[])].sort((a,b) => (currPoolEarnings[b.id]||0) - (currPoolEarnings[a.id]||0));
    const currPoolPos: Record<string, number> = {};
    let pi = 0;
    while (pi < sortedTeams.length) {
      let pj = pi;
      const earn = currPoolEarnings[sortedTeams[pi].id] || 0;
      while (pj < sortedTeams.length && (currPoolEarnings[sortedTeams[pj].id]||0) === earn) pj++;
      for (let pk = pi; pk < pj; pk++) currPoolPos[sortedTeams[pk].id] = pi + 1;
      pi = pj;
    }

    // Save new snapshot
    await sb.from("score_snapshots").upsert({
      tournament,
      snapshots: { golf: currGolf, pool: currPoolPos },
      updated_at: new Date().toISOString()
    }, { onConflict: "tournament" });

    if (!hasSnap) return new Response(JSON.stringify({sent:0,reason:"first snapshot"}),{status:200});

    // Build notifications
    const toSend: Array<{email:string; title:string; body:string}> = [];
    const seen = new Set<string>();
    const notify = (email:string, title:string, body:string) => {
      const k = `${email}|${body}`;
      if (!seen.has(k) && subMap[email]) { seen.add(k); toSend.push({email,title,body}); }
    };

    for (const team of (teams||[])) {
      const email = team.owner;
      if (!enabledPrefs.has(`${email}:${team.id}`)) continue;
      if (!subMap[email]) continue;

      const tName = team.name;

      // ── Pool standing milestones ──
      const currPos = currPoolPos[team.id] || 9999;
      const prevPos = prevPoolPos[team.id] || 9999;
      if (currPos !== prevPos) {
        const hit = checkMilestone(currPos, prevPos);
        if (hit) {
          if (hit.entered) {
            const label = hit.m === 1 ? "taken the lead in the pool! 🏆" : `entered the top ${hit.m} in the pool!`;
            notify(email, `🏊 ${tName}`, `Your team has ${label}`);
          } else {
            notify(email, `🏊 ${tName}`, `Your team has dropped out of the top ${hit.m} in the pool.`);
          }
        }
      }

      // ── Golfer milestones ──
      for (const gId of (team.golfers||[])) {
        const gName = golferMap[gId];
        if (!gName) continue;
        const espnName = Object.keys(currGolf).find(n =>
          n.toLowerCase().includes(gName.split(" ").pop()!.toLowerCase()) ||
          gName.toLowerCase().includes(n.split(" ").pop()!.toLowerCase())
        );
        if (!espnName) continue;

        const curr = numPos(currGolf[espnName].pos);
        const prev = numPos(prevGolf[espnName]?.pos || "–");
        if (curr === prev) continue;

        const hit = checkMilestone(curr, prev);
        if (!hit) continue;

        const lastName = gName.split(" ").pop();
        if (hit.entered) {
          const label = hit.m === 1 ? "taken the lead! 🏆" : `moved into the top ${hit.m}!`;
          notify(email, `⛳ ${tName}`, `${lastName} has ${label}`);
        } else {
          notify(email, `⛳ ${tName}`, `${lastName} has dropped out of the top ${hit.m}.`);
        }
      }
    }

    // Send all
    let sent = 0;
    for (const n of toSend) {
      const ok = await sendPush(subMap[n.email], {title:n.title, body:n.body, url:"/"});
      if (ok) sent++;
    }

    return new Response(JSON.stringify({sent, total:toSend.length}), {status:200});
  } catch(err) {
    console.error(err);
    return new Response(JSON.stringify({error:String(err)}), {status:500});
  }
});
