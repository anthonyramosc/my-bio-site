//AUTH
export const loginApi: string = "/auth/login-flexible"
export const registerStudentApi: string = "/auth/register"

//Themes.ts-Templates
export const themesApi ="/themes"

// Plantillas - Nuevos endpoints
export const plantillasApi = "/plantillas";
export const platillaByIdApi = "/plantillas"; // GET /{id}

//Profile
export const updateBiositeApi = "/biosites";
export const getBiositeAdminApi = "/biosites/admin";
export const getBiositeApi = "/biosites/user";
export const getBiositesApi = "/biosites"
export const getALLBiositesApi = "/biosites?page=10&size=10"

//Links
export const LinksApi = "/links"
export const LinksImageApi = "/upload/image-link";

//Sections
export const sectionsApi = "/section";
export const createSectionApi = "/section"; // POST
export const getSectionsByUserApi = "/sections/user"; // GET /:userId
export const getSectionsByBiositeApi = "/section/biosite"; // GET /:biositeId
export const reorderSectionsApi = "/section/reorder"; // PATCH /:biositeId

//Text Blocks (for Carousel)
export const BlockImageApi = "/upload/image-block";

//upload
export const uploadBiositeAvatarApi: string = "/upload/biosite-avatar"; // POST /{biositeId}
export const uploadBiositeBackgroundApi: string = "/upload/biosite-background";

//User
export const getALLUsersApi = "/users?page=10&size=10"

// BUSINESS CARDS (V-Card.ts)
export const businessCardsApi = "/business-cards";
export const createBusinessCardApi = "/business-cards"; // POST /:userId
export const getBusinessCardApi = "/business-cards"; // GET /:id
export const getBusinessCardByUserApi = "/business-cards/user"; // GET /user/:userId
export const getBusinessCardBySlugApi = "/business-cards/by-slug"; // GET /by-slug/:slug
export const regenerateQRCodeApi = "/business-cards/regenerate-qr"; // POST /regenerate-qr/:userId

// ANALYTICS - VISITS STATS
export const registerVisitApi = "/visits-stats/register-parser"; // POST
export const getVisitsByBiositeApi = "/visits-stats/biosite"; // GET /:biositeId

// ANALYTICS - LINKS CLICKS
export const registerLinkClickApi = "/links-clicks/register-parser"; // POST

// ANALYTICS - BIOSITE ANALYTICS
export const biositeAnalyticsApi = "/biosites/analytics"; // GET /:userId