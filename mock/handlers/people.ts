/**
 * Identità e persone: profilo dell'utente loggato, staff, ruoli, clienti,
 * campagne di produzione.
 *
 * `/community-profile` è l'endpoint più critico di tutto il mock: finché non
 * risponde con un MeResponse valido, `AuthenticatedLayout` resta bloccato su
 * spinner o sulla schermata "non autorizzato" e nessuna rotta è raggiungibile.
 */
import { FULL_CAPABILITIES, getDb, type Db, type DbCampaignSlot } from '../db';
import {
  asRecord,
  asStringArray,
  HttpError,
  num,
  paginate,
  type Ctx,
  type Router,
} from '../router';
import { createRng, objectId } from '../rng';

const idRng = createRng(7777);

function slotPayload(s: DbCampaignSlot) {
  return s;
}

function campaignSummary(c: Db['campaigns'][number]) {
  return {
    _id: c._id,
    name: c.name,
    totalQuestions: c.questions.length,
    remainingQuestions: c.questions.filter((q) => q.status !== 'approved').length,
    author: c.author,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function registerPeopleRoutes(router: Router): void {
  // --- profilo -------------------------------------------------------------
  router.get('/community-profile', () => {
    const db = getDb();
    const user = db.communityUsers.find((u) => u._id === db.currentUserId)!;
    return { user, capabilities: FULL_CAPABILITIES };
  });

  // --- staff ---------------------------------------------------------------
  // Attenzione: `page` qui è 0-indexed (staffService lo converte da 1-based).
  router.get('/community-users', ({ query }: Ctx) => {
    const db = getDb();
    const search = (query.get('search') ?? '').trim().toLowerCase();
    const roleId = query.get('roleId');

    const filtered = db.communityUsers.filter((u) => {
      if (roleId && !u.roleIds.includes(roleId)) return false;
      if (!search) return true;
      return [u.name, u.surname, u.email, u.cognitoId].join(' ').toLowerCase().includes(search);
    });

    const perPage = num(query, 'per_page', 20);
    const pageZero = num(query, 'page', 0);
    const start = pageZero * perPage;
    return {
      total: filtered.length,
      communityUsers: filtered.slice(start, start + perPage),
    };
  });

  router.post('/community-users', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const user = {
      _id: objectId(idRng),
      cognitoId: String(b.cognitoId ?? objectId(idRng)),
      roleIds: asStringArray(b.roleIds),
      name: '',
      surname: '',
      email: '',
      lastLogin: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.communityUsers.push(user);
    return user;
  });

  router.put('/community-users/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const user = db.communityUsers.find((u) => u._id === params.id);
    if (!user) throw new HttpError(404, 'Community user not found');
    const roleIds = asRecord(body).roleIds;
    if (Array.isArray(roleIds)) user.roleIds = asStringArray(roleIds);
    user.updatedAt = new Date().toISOString();
    return user;
  });

  router.delete('/community-users/:id', ({ params }: Ctx) => {
    const db = getDb();
    if (params.id === db.currentUserId) {
      throw new HttpError(409, 'Non puoi eliminare il tuo stesso utente');
    }
    db.communityUsers = db.communityUsers.filter((u) => u._id !== params.id);
    return undefined;
  });

  // --- ruoli ---------------------------------------------------------------
  router.get('/community-roles', () => {
    const db = getDb();
    return { data: db.roles, total: db.roles.length, page: 1, limit: db.roles.length };
  });

  router.post('/community-roles', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const role = {
      _id: objectId(idRng),
      name: String(b.name ?? 'nuovo-ruolo'),
      displayName: String(b.displayName ?? 'Nuovo ruolo'),
      description: typeof b.description === 'string' ? b.description : '',
      rank: typeof b.rank === 'number' ? b.rank : 10,
      capabilities: (Array.isArray(b.capabilities)
        ? b.capabilities
        : []) as Db['roles'][number]['capabilities'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.roles.push(role);
    return role;
  });

  router.put('/community-roles/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const role = db.roles.find((r) => r._id === params.id);
    if (!role) throw new HttpError(404, 'Role not found');
    const b = asRecord(body);
    if (typeof b.displayName === 'string') role.displayName = b.displayName;
    if (typeof b.description === 'string') role.description = b.description;
    if (typeof b.rank === 'number') role.rank = b.rank;
    if (Array.isArray(b.capabilities)) {
      role.capabilities = b.capabilities as Db['roles'][number]['capabilities'];
    }
    role.updatedAt = new Date().toISOString();
    return role;
  });

  router.delete('/community-roles/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.roles = db.roles.filter((r) => r._id !== params.id);
    return undefined;
  });

  // --- clienti (modello legacy /users) -------------------------------------
  router.get('/users', ({ query }: Ctx) => {
    const db = getDb();
    const search = (query.get('search') ?? '').trim().toLowerCase();
    const filtered = db.clients.filter(
      (c) => !search || `${c.name} ${c.surname} ${c.email}`.toLowerCase().includes(search)
    );
    const perPage = 20;
    const pageZero = num(query, 'page', 0);
    const start = pageZero * perPage;
    return {
      total: filtered.length,
      users: filtered.slice(start, start + perPage),
    };
  });

  router.get('/users/:id/modules', ({ params }: Ctx) => {
    const client = getDb().clients.find((c) => c.id === params.id);
    return client?.modules ?? [];
  });

  router.get('/users/:id', ({ params }: Ctx) => {
    const client = getDb().clients.find((c) => c.id === params.id);
    if (!client) throw new HttpError(404, 'User not found');
    return client;
  });

  router.delete('/users/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.clients = db.clients.filter((c) => c.id !== params.id);
    return undefined;
  });

  // --- campagne ------------------------------------------------------------
  router.get('/campaigns/my-slots', () => {
    const db = getDb();
    return db.campaigns.flatMap((c) =>
      c.questions
        .filter((q) => q.assigneeId === db.currentUserId)
        .map((q) => ({ ...slotPayload(q), campaignId: c._id, campaignName: c.name }))
    );
  });

  router.get('/campaigns', ({ query }: Ctx) => {
    const db = getDb();
    const page = paginate(db.campaigns, num(query, 'page', 1), num(query, 'limit', 20));
    return { ...page, data: page.data.map(campaignSummary) };
  });

  router.post('/campaigns', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const campaign = {
      _id: objectId(idRng),
      name: String(b.name ?? 'Nuova campagna'),
      author: db.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: (Array.isArray(b.questions) ? b.questions : []).map((q) => ({
        ...(asRecord(q) as unknown as DbCampaignSlot),
        _id: objectId(idRng),
      })),
    };
    db.campaigns.push(campaign);
    return { ...campaignSummary(campaign), questions: campaign.questions };
  });

  router.get('/campaigns/:id', ({ params }: Ctx) => {
    const campaign = getDb().campaigns.find((c) => c._id === params.id);
    if (!campaign) throw new HttpError(404, 'Campaign not found');
    return { ...campaignSummary(campaign), questions: campaign.questions };
  });

  router.put('/campaigns/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const campaign = db.campaigns.find((c) => c._id === params.id);
    if (!campaign) throw new HttpError(404, 'Campaign not found');
    const b = asRecord(body);
    if (typeof b.name === 'string') campaign.name = b.name;
    if (Array.isArray(b.questions)) {
      campaign.questions = b.questions.map((q) => {
        const slot = asRecord(q) as unknown as DbCampaignSlot;
        return { ...slot, _id: slot._id ?? objectId(idRng) };
      });
    }
    campaign.updatedAt = new Date().toISOString();
    return { ...campaignSummary(campaign), questions: campaign.questions };
  });

  router.delete('/campaigns/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.campaigns = db.campaigns.filter((c) => c._id !== params.id);
    return undefined;
  });

  router.put('/campaigns/:id/slots/:slotId', ({ params, body }: Ctx) => {
    const db = getDb();
    const campaign = db.campaigns.find((c) => c._id === params.id);
    const slot = campaign?.questions.find((q) => q._id === params.slotId);
    if (!campaign || !slot) throw new HttpError(404, 'Slot not found');
    Object.assign(slot, asRecord(body));
    campaign.updatedAt = new Date().toISOString();
    return slot;
  });
}
