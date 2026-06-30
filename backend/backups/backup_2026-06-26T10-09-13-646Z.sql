--
-- PostgreSQL database dump
--

\restrict tuTAYwj5X7l0f9XoAGvJfQbBd0jQiUtV15koxaOffn3SLhLrFYwcMvayiDIV1cQ

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_error_logs_level; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.enum_error_logs_level AS ENUM (
    'error',
    'warn',
    'critical'
);


ALTER TYPE public.enum_error_logs_level OWNER TO admin;

--
-- Name: enum_notifications_type; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.enum_notifications_type AS ENUM (
    'info',
    'warning',
    'success',
    'error'
);


ALTER TYPE public.enum_notifications_type OWNER TO admin;

--
-- Name: enum_posts_status; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.enum_posts_status AS ENUM (
    'draft',
    'published',
    'archived'
);


ALTER TYPE public.enum_posts_status OWNER TO admin;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.enum_users_role AS ENUM (
    'Admin',
    'Manager',
    'User'
);


ALTER TYPE public.enum_users_role OWNER TO admin;

--
-- Name: enum_users_status; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.enum_users_status AS ENUM (
    'active',
    'inactive',
    'banned'
);


ALTER TYPE public.enum_users_status OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    key character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    "isRevoked" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.api_keys OWNER TO admin;

--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.api_keys_id_seq OWNER TO admin;

--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    "userId" integer,
    action character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "entityType" character varying(255) NOT NULL,
    "entityId" integer,
    changes jsonb,
    "ipAddress" character varying(255),
    "userAgent" character varying(255)
);


ALTER TABLE public.audit_logs OWNER TO admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    slug character varying(255)
);


ALTER TABLE public.categories OWNER TO admin;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO admin;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    "senderId" integer NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO admin;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_messages_id_seq OWNER TO admin;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: error_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.error_logs (
    id integer NOT NULL,
    level public.enum_error_logs_level DEFAULT 'error'::public.enum_error_logs_level,
    message text NOT NULL,
    stack text,
    endpoint character varying(255),
    method character varying(10),
    "statusCode" integer,
    "userId" integer,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.error_logs OWNER TO admin;

--
-- Name: error_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.error_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.error_logs_id_seq OWNER TO admin;

--
-- Name: error_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.error_logs_id_seq OWNED BY public.error_logs.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    type public.enum_notifications_type DEFAULT 'info'::public.enum_notifications_type
);


ALTER TABLE public.notifications OWNER TO admin;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO admin;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: post_versions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.post_versions (
    id integer NOT NULL,
    "postId" integer NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    status character varying(255) NOT NULL,
    "editedById" integer NOT NULL,
    "changeNote" character varying(255),
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.post_versions OWNER TO admin;

--
-- Name: post_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.post_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.post_versions_id_seq OWNER TO admin;

--
-- Name: post_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.post_versions_id_seq OWNED BY public.post_versions.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    "isFeatured" boolean DEFAULT false,
    "publishedAt" timestamp with time zone,
    "authorId" integer NOT NULL,
    "categoryId" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    slug character varying(255),
    status public.enum_posts_status DEFAULT 'draft'::public.enum_posts_status,
    tags jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.posts OWNER TO admin;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO admin;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    token character varying(255) NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "ipAddress" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO admin;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO admin;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: system_metrics; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.system_metrics (
    id integer NOT NULL,
    "metricName" character varying(255) NOT NULL,
    "metricValue" double precision NOT NULL,
    "timestamp" timestamp with time zone
);


ALTER TABLE public.system_metrics OWNER TO admin;

--
-- Name: system_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.system_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_metrics_id_seq OWNER TO admin;

--
-- Name: system_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.system_metrics_id_seq OWNED BY public.system_metrics.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL,
    description text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.system_settings OWNER TO admin;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_settings_id_seq OWNER TO admin;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    role public.enum_users_role DEFAULT 'User'::public.enum_users_role,
    "isVerified" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "firstName" character varying(255) DEFAULT ''::character varying,
    "lastName" character varying(255) DEFAULT ''::character varying,
    status public.enum_users_status DEFAULT 'active'::public.enum_users_status,
    "verificationToken" character varying(255),
    "lastLogin" timestamp with time zone
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: error_logs id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.error_logs ALTER COLUMN id SET DEFAULT nextval('public.error_logs_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: post_versions id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.post_versions ALTER COLUMN id SET DEFAULT nextval('public.post_versions_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: system_metrics id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_metrics ALTER COLUMN id SET DEFAULT nextval('public.system_metrics_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.api_keys (id, "userId", key, name, "isRevoked", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.audit_logs (id, "userId", action, "createdAt", "entityType", "entityId", changes, "ipAddress", "userAgent") FROM stdin;
2	2	USER_REGISTER	2026-06-22 13:38:04.811+00	User	2	{"email": "prathamjain601@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
3	2	USER_LOGIN	2026-06-22 13:38:35.628+00	User	2	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
4	2	USER_LOGIN	2026-06-22 13:44:37.938+00	User	2	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
5	2	PUT User	2026-06-22 14:34:51.046+00	User	1	{"body": {"status": "inactive"}, "path": "/api/users/1", "method": "PUT", "responseTime": 9}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
1	\N	USER_LOGIN	2026-06-22 13:36:09.72+00	User	1	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
6	2	DELETE_USER	2026-06-22 14:35:09.374+00	User	1	{"body": null, "path": "/api/users/1", "method": "DELETE", "responseTime": 12}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
7	2	BULK_IMPORT	2026-06-22 14:38:53.225+00	User	\N	{"body": {}, "path": "/api/users/bulk-import", "method": "POST", "responseTime": 315}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
8	2	PUT User	2026-06-22 14:42:46.914+00	User	5	{"body": {"status": "banned"}, "path": "/api/users/5", "method": "PUT", "responseTime": 10}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
9	2	CREATE_POST	2026-06-22 14:47:39.127+00	Post	1	{"body": {"tags": [], "title": "FIRST POST", "status": "published", "content": "<ol><li><p style=\\"text-align: left;\\">FREF</p></li></ol><p style=\\"text-align: left;\\">FR</p><p style=\\"text-align: left;\\"></p><blockquote><p style=\\"text-align: left;\\">1VFVRV</p></blockquote><p></p>", "categoryId": null, "isFeatured": true, "publishedAt": "2026-06-22T20:17"}, "path": "/api/content/posts", "method": "POST", "responseTime": 17}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
10	2	UPDATE_POST	2026-06-22 14:48:03.012+00	Post	1	{"body": {"tags": [], "title": "FIRST POST", "status": "published", "content": "<ol><li><p style=\\"text-align: left;\\">FREF</p></li></ol><p style=\\"text-align: left;\\">FR</p><p style=\\"text-align: left;\\"></p><blockquote><p style=\\"text-align: left;\\">1VFVRV</p></blockquote><p></p>", "categoryId": null, "isFeatured": true, "publishedAt": "2026-06-22T14:47"}, "path": "/api/content/posts/1", "method": "PUT", "responseTime": 13}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
11	2	CREATE_POST	2026-06-22 14:48:35.057+00	Post	2	{"body": {"tags": [], "title": "2ND POST", "status": "draft", "content": "<p>FDVREVRE</p><p>BVBRE</p><p>BVER</p><p>B</p><p>VER</p>", "categoryId": null, "isFeatured": true, "publishedAt": "2026-06-16T20:18"}, "path": "/api/content/posts", "method": "POST", "responseTime": 13}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
12	7	USER_REGISTER	2026-06-24 20:19:51.875+00	User	7	{"email": "tanvikamath22@gmail.com"}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
13	7	USER_LOGIN	2026-06-24 20:20:32.911+00	User	7	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
14	7	USER_LOGIN	2026-06-24 20:24:47.978+00	User	7	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
15	7	USER_LOGIN	2026-06-26 06:45:13.861+00	User	7	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.categories (id, name, description, "createdAt", "updatedAt", slug) FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.chat_messages (id, "senderId", message, "createdAt") FROM stdin;
1	7	jnuiubhy	2026-06-26 09:31:00.595+00
2	7	bhubu	2026-06-26 09:31:16.94+00
3	7	bubiiubh	2026-06-26 09:31:28.832+00
\.


--
-- Data for Name: error_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.error_logs (id, level, message, stack, endpoint, method, "statusCode", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.notifications (id, "userId", title, message, "isRead", "createdAt", "updatedAt", type) FROM stdin;
1	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:45:15.452+00	2026-06-26 08:45:15.452+00	warning
2	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:45:15.452+00	2026-06-26 08:45:15.452+00	warning
3	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:45:15.452+00	2026-06-26 08:45:15.452+00	warning
4	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:46:15.493+00	2026-06-26 08:46:15.493+00	warning
5	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:46:15.493+00	2026-06-26 08:46:15.493+00	warning
6	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:46:15.493+00	2026-06-26 08:46:15.493+00	warning
7	2	System Alert: CRITICAL	Memory usage at 96% (threshold: 90%)	f	2026-06-26 08:47:15.505+00	2026-06-26 08:47:15.505+00	warning
8	3	System Alert: CRITICAL	Memory usage at 96% (threshold: 90%)	f	2026-06-26 08:47:15.505+00	2026-06-26 08:47:15.505+00	warning
9	7	System Alert: CRITICAL	Memory usage at 96% (threshold: 90%)	f	2026-06-26 08:47:15.505+00	2026-06-26 08:47:15.505+00	warning
10	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:48:15.515+00	2026-06-26 08:48:15.515+00	warning
11	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:48:15.515+00	2026-06-26 08:48:15.515+00	warning
12	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:48:15.515+00	2026-06-26 08:48:15.515+00	warning
13	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:49:15.522+00	2026-06-26 08:49:15.522+00	warning
14	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:49:15.522+00	2026-06-26 08:49:15.522+00	warning
15	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:49:15.522+00	2026-06-26 08:49:15.522+00	warning
16	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:50:15.525+00	2026-06-26 08:50:15.525+00	warning
17	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:50:15.525+00	2026-06-26 08:50:15.525+00	warning
18	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:50:15.525+00	2026-06-26 08:50:15.525+00	warning
19	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:51:15.504+00	2026-06-26 08:51:15.504+00	warning
20	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:51:15.504+00	2026-06-26 08:51:15.504+00	warning
21	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:51:15.504+00	2026-06-26 08:51:15.504+00	warning
22	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:52:15.51+00	2026-06-26 08:52:15.51+00	warning
23	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:52:15.51+00	2026-06-26 08:52:15.51+00	warning
24	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:52:15.51+00	2026-06-26 08:52:15.51+00	warning
25	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:53:15.518+00	2026-06-26 08:53:15.518+00	warning
26	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:53:15.518+00	2026-06-26 08:53:15.518+00	warning
27	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:53:15.518+00	2026-06-26 08:53:15.518+00	warning
28	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:54:15.544+00	2026-06-26 08:54:15.544+00	warning
29	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:54:15.544+00	2026-06-26 08:54:15.544+00	warning
30	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:54:15.544+00	2026-06-26 08:54:15.544+00	warning
31	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:55:43.389+00	2026-06-26 08:55:43.389+00	warning
32	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:55:43.389+00	2026-06-26 08:55:43.389+00	warning
33	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:55:43.389+00	2026-06-26 08:55:43.389+00	warning
34	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:56:43.138+00	2026-06-26 08:56:43.138+00	warning
35	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:56:43.138+00	2026-06-26 08:56:43.138+00	warning
36	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:56:43.138+00	2026-06-26 08:56:43.138+00	warning
37	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:57:43.15+00	2026-06-26 08:57:43.15+00	warning
38	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:57:43.15+00	2026-06-26 08:57:43.15+00	warning
39	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:57:43.15+00	2026-06-26 08:57:43.15+00	warning
40	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:58:43.144+00	2026-06-26 08:58:43.144+00	warning
41	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:58:43.144+00	2026-06-26 08:58:43.144+00	warning
42	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:58:43.144+00	2026-06-26 08:58:43.144+00	warning
43	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:59:43.155+00	2026-06-26 08:59:43.155+00	warning
44	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:59:43.155+00	2026-06-26 08:59:43.155+00	warning
45	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 08:59:43.155+00	2026-06-26 08:59:43.155+00	warning
46	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:00:43.164+00	2026-06-26 09:00:43.164+00	warning
47	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:00:43.164+00	2026-06-26 09:00:43.164+00	warning
48	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:00:43.164+00	2026-06-26 09:00:43.164+00	warning
49	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:01:43.173+00	2026-06-26 09:01:43.173+00	warning
50	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:01:43.173+00	2026-06-26 09:01:43.173+00	warning
51	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:01:43.173+00	2026-06-26 09:01:43.173+00	warning
52	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:02:43.207+00	2026-06-26 09:02:43.207+00	warning
53	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:02:43.207+00	2026-06-26 09:02:43.207+00	warning
54	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:02:43.207+00	2026-06-26 09:02:43.207+00	warning
55	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:03:43.216+00	2026-06-26 09:03:43.216+00	warning
56	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:03:43.216+00	2026-06-26 09:03:43.216+00	warning
57	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:03:43.216+00	2026-06-26 09:03:43.216+00	warning
58	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:04:43.195+00	2026-06-26 09:04:43.195+00	warning
59	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:04:43.195+00	2026-06-26 09:04:43.195+00	warning
60	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:04:43.195+00	2026-06-26 09:04:43.195+00	warning
61	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:05:43.215+00	2026-06-26 09:05:43.215+00	warning
62	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:05:43.215+00	2026-06-26 09:05:43.215+00	warning
63	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:05:43.215+00	2026-06-26 09:05:43.215+00	warning
64	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:07:50.345+00	2026-06-26 09:07:50.345+00	warning
65	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:07:50.345+00	2026-06-26 09:07:50.345+00	warning
66	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:07:50.345+00	2026-06-26 09:07:50.345+00	warning
67	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:08:50.347+00	2026-06-26 09:08:50.347+00	warning
68	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:08:50.347+00	2026-06-26 09:08:50.347+00	warning
69	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:08:50.347+00	2026-06-26 09:08:50.347+00	warning
70	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:09:50.353+00	2026-06-26 09:09:50.353+00	warning
71	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:09:50.353+00	2026-06-26 09:09:50.353+00	warning
72	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:09:50.353+00	2026-06-26 09:09:50.353+00	warning
73	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:10:50.308+00	2026-06-26 09:10:50.308+00	warning
74	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:10:50.308+00	2026-06-26 09:10:50.308+00	warning
75	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:10:50.308+00	2026-06-26 09:10:50.308+00	warning
76	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:11:50.367+00	2026-06-26 09:11:50.367+00	warning
77	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:11:50.367+00	2026-06-26 09:11:50.367+00	warning
78	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:11:50.367+00	2026-06-26 09:11:50.367+00	warning
79	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:12:50.362+00	2026-06-26 09:12:50.362+00	warning
80	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:12:50.362+00	2026-06-26 09:12:50.362+00	warning
81	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:12:50.362+00	2026-06-26 09:12:50.362+00	warning
82	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:13:50.46+00	2026-06-26 09:13:50.46+00	warning
83	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:13:50.46+00	2026-06-26 09:13:50.46+00	warning
84	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:13:50.46+00	2026-06-26 09:13:50.46+00	warning
85	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:14:50.337+00	2026-06-26 09:14:50.337+00	warning
86	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:14:50.337+00	2026-06-26 09:14:50.337+00	warning
87	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:14:50.337+00	2026-06-26 09:14:50.337+00	warning
88	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:15:50.39+00	2026-06-26 09:15:50.39+00	warning
89	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:15:50.39+00	2026-06-26 09:15:50.39+00	warning
90	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:15:50.39+00	2026-06-26 09:15:50.39+00	warning
91	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:16:50.342+00	2026-06-26 09:16:50.342+00	warning
92	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:16:50.342+00	2026-06-26 09:16:50.342+00	warning
93	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:16:50.342+00	2026-06-26 09:16:50.342+00	warning
94	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:17:50.384+00	2026-06-26 09:17:50.384+00	warning
95	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:17:50.384+00	2026-06-26 09:17:50.384+00	warning
96	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:17:50.384+00	2026-06-26 09:17:50.384+00	warning
97	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:18:50.4+00	2026-06-26 09:18:50.4+00	warning
98	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:18:50.4+00	2026-06-26 09:18:50.4+00	warning
99	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:18:50.4+00	2026-06-26 09:18:50.4+00	warning
100	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:19:50.471+00	2026-06-26 09:19:50.471+00	warning
101	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:19:50.471+00	2026-06-26 09:19:50.471+00	warning
102	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:19:50.471+00	2026-06-26 09:19:50.471+00	warning
103	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:30:10.96+00	2026-06-26 09:30:10.96+00	warning
104	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:30:10.96+00	2026-06-26 09:30:10.96+00	warning
105	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:30:10.96+00	2026-06-26 09:30:10.96+00	warning
106	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:31:10.602+00	2026-06-26 09:31:10.602+00	warning
107	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:31:10.602+00	2026-06-26 09:31:10.602+00	warning
108	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:31:10.602+00	2026-06-26 09:31:10.602+00	warning
109	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:32:10.64+00	2026-06-26 09:32:10.64+00	warning
110	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:32:10.64+00	2026-06-26 09:32:10.64+00	warning
111	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:32:10.64+00	2026-06-26 09:32:10.64+00	warning
112	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:33:10.715+00	2026-06-26 09:33:10.715+00	warning
113	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:33:10.715+00	2026-06-26 09:33:10.715+00	warning
114	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:33:10.715+00	2026-06-26 09:33:10.715+00	warning
115	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:34:10.668+00	2026-06-26 09:34:10.668+00	warning
116	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:34:10.668+00	2026-06-26 09:34:10.668+00	warning
117	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:34:10.668+00	2026-06-26 09:34:10.668+00	warning
118	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:35:10.656+00	2026-06-26 09:35:10.656+00	warning
119	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:35:10.656+00	2026-06-26 09:35:10.656+00	warning
120	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:35:10.656+00	2026-06-26 09:35:10.656+00	warning
121	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:36:10.641+00	2026-06-26 09:36:10.641+00	warning
122	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:36:10.641+00	2026-06-26 09:36:10.641+00	warning
123	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:36:10.641+00	2026-06-26 09:36:10.641+00	warning
124	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:37:49.914+00	2026-06-26 09:37:49.914+00	warning
125	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:37:49.914+00	2026-06-26 09:37:49.914+00	warning
126	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:37:49.914+00	2026-06-26 09:37:49.914+00	warning
127	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:38:49.9+00	2026-06-26 09:38:49.9+00	warning
128	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:38:49.9+00	2026-06-26 09:38:49.9+00	warning
129	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:38:49.9+00	2026-06-26 09:38:49.9+00	warning
130	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:39:49.871+00	2026-06-26 09:39:49.871+00	warning
131	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:39:49.871+00	2026-06-26 09:39:49.871+00	warning
132	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:39:49.871+00	2026-06-26 09:39:49.871+00	warning
133	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:40:49.881+00	2026-06-26 09:40:49.881+00	warning
134	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:40:49.881+00	2026-06-26 09:40:49.881+00	warning
135	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:40:49.881+00	2026-06-26 09:40:49.881+00	warning
136	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:41:49.864+00	2026-06-26 09:41:49.864+00	warning
137	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:41:49.864+00	2026-06-26 09:41:49.864+00	warning
138	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:41:49.864+00	2026-06-26 09:41:49.864+00	warning
139	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:42:49.877+00	2026-06-26 09:42:49.877+00	warning
140	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:42:49.877+00	2026-06-26 09:42:49.877+00	warning
141	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:42:49.877+00	2026-06-26 09:42:49.877+00	warning
142	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:43:49.858+00	2026-06-26 09:43:49.858+00	warning
143	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:43:49.858+00	2026-06-26 09:43:49.858+00	warning
144	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:43:49.858+00	2026-06-26 09:43:49.858+00	warning
145	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:44:49.852+00	2026-06-26 09:44:49.852+00	warning
146	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:44:49.852+00	2026-06-26 09:44:49.852+00	warning
147	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:44:49.852+00	2026-06-26 09:44:49.852+00	warning
148	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:45:49.859+00	2026-06-26 09:45:49.859+00	warning
149	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:45:49.859+00	2026-06-26 09:45:49.859+00	warning
150	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:45:49.859+00	2026-06-26 09:45:49.859+00	warning
151	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:47:23.606+00	2026-06-26 09:47:23.606+00	warning
152	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:47:23.606+00	2026-06-26 09:47:23.606+00	warning
153	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:47:23.606+00	2026-06-26 09:47:23.606+00	warning
154	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:48:23.604+00	2026-06-26 09:48:23.604+00	warning
155	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:48:23.604+00	2026-06-26 09:48:23.604+00	warning
156	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:48:23.604+00	2026-06-26 09:48:23.604+00	warning
157	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:49:23.611+00	2026-06-26 09:49:23.611+00	warning
158	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:49:23.611+00	2026-06-26 09:49:23.611+00	warning
159	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:49:23.611+00	2026-06-26 09:49:23.611+00	warning
160	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:50:47.034+00	2026-06-26 09:50:47.034+00	warning
161	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:50:47.034+00	2026-06-26 09:50:47.034+00	warning
162	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:50:47.034+00	2026-06-26 09:50:47.034+00	warning
163	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:52:29.661+00	2026-06-26 09:52:29.661+00	warning
164	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:52:29.661+00	2026-06-26 09:52:29.661+00	warning
165	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:52:29.661+00	2026-06-26 09:52:29.661+00	warning
166	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:53:29.678+00	2026-06-26 09:53:29.678+00	warning
167	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:53:29.678+00	2026-06-26 09:53:29.678+00	warning
168	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:53:29.678+00	2026-06-26 09:53:29.678+00	warning
169	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:54:29.681+00	2026-06-26 09:54:29.681+00	warning
170	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:54:29.681+00	2026-06-26 09:54:29.681+00	warning
171	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:54:29.681+00	2026-06-26 09:54:29.681+00	warning
172	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:55:29.684+00	2026-06-26 09:55:29.684+00	warning
173	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:55:29.684+00	2026-06-26 09:55:29.684+00	warning
174	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:55:29.684+00	2026-06-26 09:55:29.684+00	warning
175	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:56:29.672+00	2026-06-26 09:56:29.672+00	warning
176	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:56:29.672+00	2026-06-26 09:56:29.672+00	warning
177	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:56:29.672+00	2026-06-26 09:56:29.672+00	warning
178	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:57:29.684+00	2026-06-26 09:57:29.684+00	warning
179	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:57:29.684+00	2026-06-26 09:57:29.684+00	warning
180	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:57:29.684+00	2026-06-26 09:57:29.684+00	warning
181	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:58:29.687+00	2026-06-26 09:58:29.687+00	warning
182	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:58:29.687+00	2026-06-26 09:58:29.687+00	warning
183	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 09:58:29.687+00	2026-06-26 09:58:29.687+00	warning
184	2	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:59:29.69+00	2026-06-26 09:59:29.69+00	warning
185	3	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:59:29.69+00	2026-06-26 09:59:29.69+00	warning
186	7	System Alert: CRITICAL	Memory usage at 98% (threshold: 90%)	f	2026-06-26 09:59:29.69+00	2026-06-26 09:59:29.69+00	warning
187	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:00:29.718+00	2026-06-26 10:00:29.718+00	warning
188	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:00:29.718+00	2026-06-26 10:00:29.718+00	warning
189	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:00:29.718+00	2026-06-26 10:00:29.718+00	warning
190	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:01:29.718+00	2026-06-26 10:01:29.718+00	warning
191	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:01:29.718+00	2026-06-26 10:01:29.718+00	warning
192	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:01:29.718+00	2026-06-26 10:01:29.718+00	warning
193	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:02:29.737+00	2026-06-26 10:02:29.737+00	warning
194	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:02:29.737+00	2026-06-26 10:02:29.737+00	warning
195	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:02:29.737+00	2026-06-26 10:02:29.737+00	warning
196	2	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:03:29.74+00	2026-06-26 10:03:29.74+00	warning
197	3	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:03:29.74+00	2026-06-26 10:03:29.74+00	warning
198	7	System Alert: CRITICAL	Memory usage at 97% (threshold: 90%)	f	2026-06-26 10:03:29.74+00	2026-06-26 10:03:29.74+00	warning
\.


--
-- Data for Name: post_versions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.post_versions (id, "postId", version, title, content, status, "editedById", "changeNote", "createdAt") FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.posts (id, title, content, "isFeatured", "publishedAt", "authorId", "categoryId", "createdAt", "updatedAt", slug, status, tags) FROM stdin;
1	FIRST POST	<ol><li><p style="text-align: left;">FREF</p></li></ol><p style="text-align: left;">FR</p><p style="text-align: left;"></p><blockquote><p style="text-align: left;">1VFVRV</p></blockquote><p></p>	t	2026-06-22 09:17:00+00	2	\N	2026-06-22 14:47:39.115+00	2026-06-22 14:48:03.002+00	first-post	published	[]
2	2ND POST	<p>FDVREVRE</p><p>BVBRE</p><p>BVER</p><p>B</p><p>VER</p>	t	2026-06-16 14:48:00+00	2	\N	2026-06-22 14:48:35.044+00	2026-06-22 14:48:35.044+00	2nd-post	draft	[]
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.sessions (id, "userId", token, "expiresAt", "ipAddress", "createdAt", "updatedAt") FROM stdin;
2	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IlVzZXIiLCJpYXQiOjE3ODIxMzU1MTUsImV4cCI6MTc4MjIyMTkxNX0.XYOTbHPqPW41YUIOSnStBLzLB10cffZmYdLeZjX4vLs	2026-06-23 13:38:35.62+00	::1	2026-06-22 13:38:35.621+00	2026-06-22 13:38:35.621+00
3	2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzgyMTM1ODc3LCJleHAiOjE3ODIyMjIyNzd9.IujcJ5hnI1e1SOHHC74qAgPO8Zdq_2E6HaY6ZTw5Oh4	2026-06-23 13:44:37.933+00	::1	2026-06-22 13:44:37.933+00	2026-06-22 13:44:37.933+00
4	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6IlVzZXIiLCJpYXQiOjE3ODIzMzI0MzIsImV4cCI6MTc4MjQxODgzMn0.dGkqHPeERsi80ySvmGFrsM8S0pHLG_xQ4EKsHvPnvx0	2026-06-25 20:20:32.904+00	::1	2026-06-24 20:20:32.904+00	2026-06-24 20:20:32.904+00
5	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6IkFkbWluIiwiaWF0IjoxNzgyMzMyNjg3LCJleHAiOjE3ODI0MTkwODd9.0Q7cjvtwpR3fZlgYKkVGmc-NS5j5fMklMsWJOrKDOkc	2026-06-25 20:24:47.97+00	::1	2026-06-24 20:24:47.971+00	2026-06-24 20:24:47.971+00
6	7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6IkFkbWluIiwiaWF0IjoxNzgyNDU2MzEzLCJleHAiOjE3ODI1NDI3MTN9.eAFJuBXZoNQBJrLa6kqgDYMHPU7WP4CzK2yQ0ZOK7OI	2026-06-27 06:45:13.815+00	::1	2026-06-26 06:45:13.82+00	2026-06-26 06:45:13.82+00
\.


--
-- Data for Name: system_metrics; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.system_metrics (id, "metricName", "metricValue", "timestamp") FROM stdin;
1	cpu_load_1m	0	2026-06-22 13:24:45.819+00
2	memory_percent	89	2026-06-22 13:24:45.819+00
3	heap_used_mb	206	2026-06-22 13:24:45.819+00
4	api_avg_response_ms	0	2026-06-22 13:24:45.819+00
5	api_total_requests	0	2026-06-22 13:24:45.819+00
6	cpu_load_1m	0	2026-06-22 13:25:45.831+00
7	memory_percent	97	2026-06-22 13:25:45.831+00
8	heap_used_mb	178	2026-06-22 13:25:45.831+00
9	api_avg_response_ms	0	2026-06-22 13:25:45.831+00
10	api_total_requests	0	2026-06-22 13:25:45.831+00
11	cpu_load_1m	0	2026-06-22 13:26:45.841+00
12	memory_percent	97	2026-06-22 13:26:45.841+00
13	heap_used_mb	179	2026-06-22 13:26:45.841+00
14	api_avg_response_ms	0	2026-06-22 13:26:45.841+00
15	api_total_requests	0	2026-06-22 13:26:45.841+00
16	cpu_load_1m	0	2026-06-22 13:26:50.557+00
17	memory_percent	87	2026-06-22 13:26:50.557+00
18	heap_used_mb	204	2026-06-22 13:26:50.557+00
19	api_avg_response_ms	0	2026-06-22 13:26:50.557+00
20	api_total_requests	0	2026-06-22 13:26:50.557+00
21	cpu_load_1m	0	2026-06-22 13:27:45.85+00
22	memory_percent	97	2026-06-22 13:27:45.85+00
23	heap_used_mb	179	2026-06-22 13:27:45.85+00
24	api_avg_response_ms	0	2026-06-22 13:27:45.85+00
25	api_total_requests	0	2026-06-22 13:27:45.85+00
26	cpu_load_1m	0	2026-06-22 13:28:45.854+00
27	memory_percent	96	2026-06-22 13:28:45.854+00
28	heap_used_mb	179	2026-06-22 13:28:45.854+00
29	api_avg_response_ms	0	2026-06-22 13:28:45.854+00
30	api_total_requests	0	2026-06-22 13:28:45.854+00
31	cpu_load_1m	0	2026-06-22 13:29:45.854+00
32	memory_percent	97	2026-06-22 13:29:45.854+00
33	heap_used_mb	179	2026-06-22 13:29:45.854+00
34	api_avg_response_ms	0	2026-06-22 13:29:45.854+00
35	api_total_requests	0	2026-06-22 13:29:45.854+00
36	cpu_load_1m	0	2026-06-22 13:30:45.87+00
37	memory_percent	97	2026-06-22 13:30:45.87+00
38	heap_used_mb	179	2026-06-22 13:30:45.87+00
39	api_avg_response_ms	0	2026-06-22 13:30:45.87+00
40	api_total_requests	0	2026-06-22 13:30:45.87+00
41	cpu_load_1m	0	2026-06-22 13:31:45.884+00
42	memory_percent	97	2026-06-22 13:31:45.884+00
43	heap_used_mb	179	2026-06-22 13:31:45.884+00
44	api_avg_response_ms	0	2026-06-22 13:31:45.884+00
45	api_total_requests	0	2026-06-22 13:31:45.884+00
46	cpu_load_1m	0	2026-06-22 13:32:45.894+00
47	memory_percent	97	2026-06-22 13:32:45.894+00
48	heap_used_mb	179	2026-06-22 13:32:45.894+00
49	api_avg_response_ms	0	2026-06-22 13:32:45.894+00
50	api_total_requests	0	2026-06-22 13:32:45.894+00
51	cpu_load_1m	0	2026-06-22 13:33:45.897+00
52	memory_percent	97	2026-06-22 13:33:45.897+00
53	heap_used_mb	179	2026-06-22 13:33:45.897+00
54	api_avg_response_ms	0	2026-06-22 13:33:45.897+00
55	api_total_requests	0	2026-06-22 13:33:45.897+00
56	cpu_load_1m	0	2026-06-22 13:35:29.144+00
57	memory_percent	87	2026-06-22 13:35:29.144+00
58	heap_used_mb	204	2026-06-22 13:35:29.144+00
59	api_avg_response_ms	0	2026-06-22 13:35:29.144+00
60	api_total_requests	0	2026-06-22 13:35:29.144+00
61	cpu_load_1m	0	2026-06-22 13:36:29.161+00
62	memory_percent	97	2026-06-22 13:36:29.161+00
63	heap_used_mb	182	2026-06-22 13:36:29.161+00
64	api_avg_response_ms	27	2026-06-22 13:36:29.161+00
65	api_total_requests	27	2026-06-22 13:36:29.161+00
66	cpu_load_1m	0	2026-06-22 13:37:29.169+00
67	memory_percent	98	2026-06-22 13:37:29.169+00
68	heap_used_mb	182	2026-06-22 13:37:29.169+00
69	api_avg_response_ms	26	2026-06-22 13:37:29.169+00
70	api_total_requests	28	2026-06-22 13:37:29.169+00
71	cpu_load_1m	0	2026-06-22 13:38:29.177+00
72	memory_percent	97	2026-06-22 13:38:29.177+00
73	heap_used_mb	182	2026-06-22 13:38:29.177+00
74	api_avg_response_ms	133	2026-06-22 13:38:29.177+00
75	api_total_requests	29	2026-06-22 13:38:29.177+00
76	cpu_load_1m	0	2026-06-22 13:39:29.189+00
77	memory_percent	97	2026-06-22 13:39:29.189+00
78	heap_used_mb	184	2026-06-22 13:39:29.189+00
79	api_avg_response_ms	76	2026-06-22 13:39:29.189+00
80	api_total_requests	58	2026-06-22 13:39:29.189+00
81	cpu_load_1m	0	2026-06-22 13:40:29.202+00
82	memory_percent	97	2026-06-22 13:40:29.202+00
83	heap_used_mb	184	2026-06-22 13:40:29.202+00
84	api_avg_response_ms	76	2026-06-22 13:40:29.202+00
85	api_total_requests	58	2026-06-22 13:40:29.202+00
86	cpu_load_1m	0	2026-06-22 13:41:29.21+00
87	memory_percent	97	2026-06-22 13:41:29.21+00
88	heap_used_mb	184	2026-06-22 13:41:29.21+00
89	api_avg_response_ms	76	2026-06-22 13:41:29.21+00
90	api_total_requests	58	2026-06-22 13:41:29.21+00
91	cpu_load_1m	0	2026-06-22 13:42:29.216+00
92	memory_percent	97	2026-06-22 13:42:29.216+00
93	heap_used_mb	184	2026-06-22 13:42:29.216+00
94	api_avg_response_ms	76	2026-06-22 13:42:29.216+00
95	api_total_requests	58	2026-06-22 13:42:29.216+00
96	cpu_load_1m	0	2026-06-22 13:43:29.224+00
97	memory_percent	97	2026-06-22 13:43:29.224+00
98	heap_used_mb	184	2026-06-22 13:43:29.224+00
99	api_avg_response_ms	76	2026-06-22 13:43:29.224+00
100	api_total_requests	58	2026-06-22 13:43:29.224+00
101	cpu_load_1m	0	2026-06-22 13:44:29.236+00
102	memory_percent	97	2026-06-22 13:44:29.236+00
103	heap_used_mb	184	2026-06-22 13:44:29.236+00
104	api_avg_response_ms	74	2026-06-22 13:44:29.236+00
105	api_total_requests	59	2026-06-22 13:44:29.236+00
106	cpu_load_1m	0	2026-06-22 13:45:29.237+00
107	memory_percent	97	2026-06-22 13:45:29.237+00
108	heap_used_mb	185	2026-06-22 13:45:29.237+00
109	api_avg_response_ms	70	2026-06-22 13:45:29.237+00
110	api_total_requests	68	2026-06-22 13:45:29.237+00
111	cpu_load_1m	0	2026-06-22 13:46:29.243+00
112	memory_percent	97	2026-06-22 13:46:29.243+00
113	heap_used_mb	185	2026-06-22 13:46:29.243+00
114	api_avg_response_ms	68	2026-06-22 13:46:29.243+00
115	api_total_requests	70	2026-06-22 13:46:29.243+00
116	cpu_load_1m	0	2026-06-22 13:47:29.249+00
117	memory_percent	97	2026-06-22 13:47:29.249+00
118	heap_used_mb	185	2026-06-22 13:47:29.249+00
119	api_avg_response_ms	68	2026-06-22 13:47:29.249+00
120	api_total_requests	70	2026-06-22 13:47:29.249+00
121	cpu_load_1m	0	2026-06-22 13:48:29.25+00
122	memory_percent	97	2026-06-22 13:48:29.25+00
123	heap_used_mb	185	2026-06-22 13:48:29.25+00
124	api_avg_response_ms	68	2026-06-22 13:48:29.25+00
125	api_total_requests	70	2026-06-22 13:48:29.25+00
126	cpu_load_1m	0	2026-06-22 13:49:29.25+00
127	memory_percent	98	2026-06-22 13:49:29.25+00
128	heap_used_mb	185	2026-06-22 13:49:29.25+00
129	api_avg_response_ms	68	2026-06-22 13:49:29.25+00
130	api_total_requests	70	2026-06-22 13:49:29.25+00
131	cpu_load_1m	0	2026-06-22 13:50:29.26+00
132	memory_percent	97	2026-06-22 13:50:29.26+00
133	heap_used_mb	185	2026-06-22 13:50:29.26+00
134	api_avg_response_ms	68	2026-06-22 13:50:29.26+00
135	api_total_requests	70	2026-06-22 13:50:29.26+00
136	cpu_load_1m	0	2026-06-22 13:51:29.266+00
137	memory_percent	97	2026-06-22 13:51:29.266+00
138	heap_used_mb	185	2026-06-22 13:51:29.266+00
139	api_avg_response_ms	68	2026-06-22 13:51:29.266+00
140	api_total_requests	70	2026-06-22 13:51:29.266+00
141	cpu_load_1m	0	2026-06-22 13:52:29.275+00
142	memory_percent	98	2026-06-22 13:52:29.275+00
143	heap_used_mb	185	2026-06-22 13:52:29.275+00
144	api_avg_response_ms	68	2026-06-22 13:52:29.275+00
145	api_total_requests	70	2026-06-22 13:52:29.275+00
146	cpu_load_1m	0	2026-06-22 13:53:29.275+00
147	memory_percent	97	2026-06-22 13:53:29.275+00
148	heap_used_mb	185	2026-06-22 13:53:29.275+00
149	api_avg_response_ms	68	2026-06-22 13:53:29.275+00
150	api_total_requests	70	2026-06-22 13:53:29.275+00
151	cpu_load_1m	0	2026-06-22 13:54:29.279+00
152	memory_percent	97	2026-06-22 13:54:29.279+00
153	heap_used_mb	185	2026-06-22 13:54:29.279+00
154	api_avg_response_ms	68	2026-06-22 13:54:29.279+00
155	api_total_requests	70	2026-06-22 13:54:29.279+00
156	cpu_load_1m	0	2026-06-22 13:55:29.284+00
157	memory_percent	97	2026-06-22 13:55:29.284+00
158	heap_used_mb	185	2026-06-22 13:55:29.284+00
159	api_avg_response_ms	68	2026-06-22 13:55:29.284+00
160	api_total_requests	70	2026-06-22 13:55:29.284+00
161	cpu_load_1m	0	2026-06-22 13:56:29.293+00
162	memory_percent	97	2026-06-22 13:56:29.293+00
163	heap_used_mb	185	2026-06-22 13:56:29.293+00
164	api_avg_response_ms	68	2026-06-22 13:56:29.293+00
165	api_total_requests	70	2026-06-22 13:56:29.293+00
166	cpu_load_1m	0	2026-06-22 14:18:26.524+00
167	memory_percent	97	2026-06-22 14:18:26.524+00
168	heap_used_mb	185	2026-06-22 14:18:26.524+00
169	api_avg_response_ms	68	2026-06-22 14:18:26.524+00
170	api_total_requests	70	2026-06-22 14:18:26.524+00
171	cpu_load_1m	0	2026-06-22 14:19:26.535+00
172	memory_percent	97	2026-06-22 14:19:26.535+00
173	heap_used_mb	185	2026-06-22 14:19:26.535+00
174	api_avg_response_ms	66	2026-06-22 14:19:26.535+00
175	api_total_requests	74	2026-06-22 14:19:26.535+00
176	cpu_load_1m	0	2026-06-22 14:20:26.545+00
177	memory_percent	98	2026-06-22 14:20:26.545+00
178	heap_used_mb	186	2026-06-22 14:20:26.545+00
179	api_avg_response_ms	66	2026-06-22 14:20:26.545+00
180	api_total_requests	74	2026-06-22 14:20:26.545+00
181	cpu_load_1m	0	2026-06-22 14:21:26.556+00
182	memory_percent	97	2026-06-22 14:21:26.556+00
183	heap_used_mb	185	2026-06-22 14:21:26.556+00
184	api_avg_response_ms	66	2026-06-22 14:21:26.556+00
185	api_total_requests	74	2026-06-22 14:21:26.556+00
186	cpu_load_1m	0	2026-06-22 14:22:26.563+00
187	memory_percent	97	2026-06-22 14:22:26.563+00
188	heap_used_mb	185	2026-06-22 14:22:26.563+00
189	api_avg_response_ms	66	2026-06-22 14:22:26.563+00
190	api_total_requests	74	2026-06-22 14:22:26.563+00
191	cpu_load_1m	0	2026-06-22 14:23:26.575+00
192	memory_percent	98	2026-06-22 14:23:26.575+00
193	heap_used_mb	186	2026-06-22 14:23:26.575+00
194	api_avg_response_ms	66	2026-06-22 14:23:26.575+00
195	api_total_requests	74	2026-06-22 14:23:26.575+00
196	cpu_load_1m	0	2026-06-22 14:24:26.593+00
197	memory_percent	97	2026-06-22 14:24:26.593+00
198	heap_used_mb	185	2026-06-22 14:24:26.593+00
199	api_avg_response_ms	66	2026-06-22 14:24:26.593+00
200	api_total_requests	74	2026-06-22 14:24:26.593+00
201	cpu_load_1m	0	2026-06-22 14:25:26.593+00
202	memory_percent	97	2026-06-22 14:25:26.593+00
203	heap_used_mb	185	2026-06-22 14:25:26.593+00
204	api_avg_response_ms	66	2026-06-22 14:25:26.593+00
205	api_total_requests	74	2026-06-22 14:25:26.593+00
206	cpu_load_1m	0	2026-06-22 14:26:26.595+00
207	memory_percent	97	2026-06-22 14:26:26.595+00
208	heap_used_mb	186	2026-06-22 14:26:26.595+00
209	api_avg_response_ms	66	2026-06-22 14:26:26.595+00
210	api_total_requests	74	2026-06-22 14:26:26.595+00
211	cpu_load_1m	0	2026-06-22 14:27:26.599+00
212	memory_percent	97	2026-06-22 14:27:26.599+00
213	heap_used_mb	185	2026-06-22 14:27:26.599+00
214	api_avg_response_ms	66	2026-06-22 14:27:26.599+00
215	api_total_requests	74	2026-06-22 14:27:26.599+00
216	cpu_load_1m	0	2026-06-22 14:28:26.61+00
217	memory_percent	97	2026-06-22 14:28:26.61+00
218	heap_used_mb	186	2026-06-22 14:28:26.61+00
219	api_avg_response_ms	63	2026-06-22 14:28:26.61+00
220	api_total_requests	78	2026-06-22 14:28:26.61+00
221	cpu_load_1m	0	2026-06-22 14:29:26.623+00
222	memory_percent	97	2026-06-22 14:29:26.623+00
223	heap_used_mb	186	2026-06-22 14:29:26.623+00
224	api_avg_response_ms	63	2026-06-22 14:29:26.623+00
225	api_total_requests	79	2026-06-22 14:29:26.623+00
226	cpu_load_1m	0	2026-06-22 14:30:26.63+00
227	memory_percent	98	2026-06-22 14:30:26.63+00
228	heap_used_mb	186	2026-06-22 14:30:26.63+00
229	api_avg_response_ms	63	2026-06-22 14:30:26.63+00
230	api_total_requests	79	2026-06-22 14:30:26.63+00
231	cpu_load_1m	0	2026-06-22 14:31:26.641+00
232	memory_percent	97	2026-06-22 14:31:26.641+00
233	heap_used_mb	186	2026-06-22 14:31:26.641+00
234	api_avg_response_ms	61	2026-06-22 14:31:26.641+00
235	api_total_requests	83	2026-06-22 14:31:26.641+00
236	cpu_load_1m	0	2026-06-22 14:32:26.654+00
237	memory_percent	97	2026-06-22 14:32:26.654+00
238	heap_used_mb	187	2026-06-22 14:32:26.654+00
239	api_avg_response_ms	57	2026-06-22 14:32:26.654+00
240	api_total_requests	91	2026-06-22 14:32:26.654+00
241	cpu_load_1m	0	2026-06-22 14:33:26.661+00
242	memory_percent	97	2026-06-22 14:33:26.661+00
243	heap_used_mb	187	2026-06-22 14:33:26.661+00
244	api_avg_response_ms	56	2026-06-22 14:33:26.661+00
245	api_total_requests	95	2026-06-22 14:33:26.661+00
246	cpu_load_1m	0	2026-06-22 14:34:26.662+00
247	memory_percent	97	2026-06-22 14:34:26.662+00
248	heap_used_mb	187	2026-06-22 14:34:26.662+00
249	api_avg_response_ms	56	2026-06-22 14:34:26.662+00
250	api_total_requests	96	2026-06-22 14:34:26.662+00
251	cpu_load_1m	0	2026-06-22 14:35:26.674+00
252	memory_percent	97	2026-06-22 14:35:26.674+00
253	heap_used_mb	187	2026-06-22 14:35:26.674+00
254	api_avg_response_ms	53	2026-06-22 14:35:26.674+00
255	api_total_requests	104	2026-06-22 14:35:26.674+00
256	cpu_load_1m	0	2026-06-22 14:36:26.681+00
257	memory_percent	97	2026-06-22 14:36:26.681+00
258	heap_used_mb	188	2026-06-22 14:36:26.681+00
259	api_avg_response_ms	53	2026-06-22 14:36:26.681+00
260	api_total_requests	104	2026-06-22 14:36:26.681+00
261	cpu_load_1m	0	2026-06-22 14:37:26.695+00
262	memory_percent	98	2026-06-22 14:37:26.695+00
263	heap_used_mb	188	2026-06-22 14:37:26.695+00
264	api_avg_response_ms	53	2026-06-22 14:37:26.695+00
265	api_total_requests	104	2026-06-22 14:37:26.695+00
266	cpu_load_1m	0	2026-06-22 14:38:26.707+00
267	memory_percent	97	2026-06-22 14:38:26.707+00
268	heap_used_mb	187	2026-06-22 14:38:26.707+00
269	api_avg_response_ms	53	2026-06-22 14:38:26.707+00
270	api_total_requests	104	2026-06-22 14:38:26.707+00
271	cpu_load_1m	0	2026-06-22 14:39:26.709+00
272	memory_percent	97	2026-06-22 14:39:26.709+00
273	heap_used_mb	188	2026-06-22 14:39:26.709+00
274	api_avg_response_ms	55	2026-06-22 14:39:26.709+00
275	api_total_requests	106	2026-06-22 14:39:26.709+00
276	cpu_load_1m	0	2026-06-22 14:40:26.72+00
277	memory_percent	98	2026-06-22 14:40:26.72+00
278	heap_used_mb	188	2026-06-22 14:40:26.72+00
279	api_avg_response_ms	53	2026-06-22 14:40:26.72+00
280	api_total_requests	111	2026-06-22 14:40:26.72+00
281	cpu_load_1m	0	2026-06-22 14:41:26.72+00
282	memory_percent	97	2026-06-22 14:41:26.72+00
283	heap_used_mb	188	2026-06-22 14:41:26.72+00
284	api_avg_response_ms	53	2026-06-22 14:41:26.72+00
285	api_total_requests	111	2026-06-22 14:41:26.72+00
286	cpu_load_1m	0	2026-06-22 14:42:26.735+00
287	memory_percent	98	2026-06-22 14:42:26.735+00
288	heap_used_mb	188	2026-06-22 14:42:26.735+00
289	api_avg_response_ms	53	2026-06-22 14:42:26.735+00
290	api_total_requests	113	2026-06-22 14:42:26.735+00
291	cpu_load_1m	0	2026-06-22 14:43:26.749+00
292	memory_percent	97	2026-06-22 14:43:26.749+00
293	heap_used_mb	189	2026-06-22 14:43:26.749+00
294	api_avg_response_ms	46	2026-06-22 14:43:26.749+00
295	api_total_requests	134	2026-06-22 14:43:26.749+00
296	cpu_load_1m	0	2026-06-22 14:44:26.759+00
297	memory_percent	97	2026-06-22 14:44:26.759+00
298	heap_used_mb	190	2026-06-22 14:44:26.759+00
299	api_avg_response_ms	40	2026-06-22 14:44:26.759+00
300	api_total_requests	156	2026-06-22 14:44:26.759+00
301	cpu_load_1m	0	2026-06-22 14:45:26.77+00
302	memory_percent	97	2026-06-22 14:45:26.77+00
303	heap_used_mb	190	2026-06-22 14:45:26.77+00
304	api_avg_response_ms	40	2026-06-22 14:45:26.77+00
305	api_total_requests	160	2026-06-22 14:45:26.77+00
306	cpu_load_1m	0	2026-06-22 14:46:26.786+00
307	memory_percent	97	2026-06-22 14:46:26.786+00
308	heap_used_mb	190	2026-06-22 14:46:26.786+00
309	api_avg_response_ms	40	2026-06-22 14:46:26.786+00
310	api_total_requests	160	2026-06-22 14:46:26.786+00
311	cpu_load_1m	0	2026-06-22 14:47:26.789+00
312	memory_percent	97	2026-06-22 14:47:26.789+00
313	heap_used_mb	190	2026-06-22 14:47:26.789+00
314	api_avg_response_ms	40	2026-06-22 14:47:26.789+00
315	api_total_requests	160	2026-06-22 14:47:26.789+00
316	cpu_load_1m	0	2026-06-22 14:48:26.803+00
317	memory_percent	97	2026-06-22 14:48:26.803+00
318	heap_used_mb	191	2026-06-22 14:48:26.803+00
319	api_avg_response_ms	36	2026-06-22 14:48:26.803+00
320	api_total_requests	182	2026-06-22 14:48:26.803+00
321	cpu_load_1m	0	2026-06-22 14:49:26.816+00
322	memory_percent	97	2026-06-22 14:49:26.816+00
323	heap_used_mb	191	2026-06-22 14:49:26.816+00
324	api_avg_response_ms	34	2026-06-22 14:49:26.816+00
325	api_total_requests	197	2026-06-22 14:49:26.816+00
326	cpu_load_1m	0	2026-06-22 14:50:26.828+00
327	memory_percent	97	2026-06-22 14:50:26.828+00
328	heap_used_mb	192	2026-06-22 14:50:26.828+00
329	api_avg_response_ms	32	2026-06-22 14:50:26.828+00
330	api_total_requests	207	2026-06-22 14:50:26.828+00
331	cpu_load_1m	0	2026-06-22 14:51:26.831+00
332	memory_percent	97	2026-06-22 14:51:26.831+00
333	heap_used_mb	194	2026-06-22 14:51:26.831+00
334	api_avg_response_ms	27	2026-06-22 14:51:26.831+00
335	api_total_requests	257	2026-06-22 14:51:26.831+00
336	cpu_load_1m	0	2026-06-22 14:52:26.838+00
337	memory_percent	97	2026-06-22 14:52:26.838+00
338	heap_used_mb	195	2026-06-22 14:52:26.838+00
339	api_avg_response_ms	26	2026-06-22 14:52:26.838+00
340	api_total_requests	275	2026-06-22 14:52:26.838+00
341	cpu_load_1m	0	2026-06-22 14:53:26.853+00
342	memory_percent	97	2026-06-22 14:53:26.853+00
343	heap_used_mb	195	2026-06-22 14:53:26.853+00
344	api_avg_response_ms	26	2026-06-22 14:53:26.853+00
345	api_total_requests	285	2026-06-22 14:53:26.853+00
346	cpu_load_1m	0	2026-06-22 14:54:26.869+00
347	memory_percent	97	2026-06-22 14:54:26.869+00
348	heap_used_mb	196	2026-06-22 14:54:26.869+00
349	api_avg_response_ms	24	2026-06-22 14:54:26.869+00
350	api_total_requests	323	2026-06-22 14:54:26.869+00
351	cpu_load_1m	0	2026-06-22 14:58:00.232+00
352	memory_percent	88	2026-06-22 14:58:00.232+00
353	heap_used_mb	204	2026-06-22 14:58:00.232+00
354	api_avg_response_ms	0	2026-06-22 14:58:00.232+00
355	api_total_requests	0	2026-06-22 14:58:00.232+00
356	cpu_load_1m	0	2026-06-24 20:16:55.926+00
357	memory_percent	88	2026-06-24 20:16:55.926+00
358	heap_used_mb	203	2026-06-24 20:16:55.926+00
359	api_avg_response_ms	0	2026-06-24 20:16:55.926+00
360	api_total_requests	0	2026-06-24 20:16:55.926+00
361	cpu_load_1m	0	2026-06-24 20:17:55.951+00
362	memory_percent	97	2026-06-24 20:17:55.951+00
363	heap_used_mb	184	2026-06-24 20:17:55.951+00
364	api_avg_response_ms	34	2026-06-24 20:17:55.951+00
365	api_total_requests	17	2026-06-24 20:17:55.951+00
366	cpu_load_1m	0	2026-06-24 20:18:55.961+00
367	memory_percent	97	2026-06-24 20:18:55.961+00
368	heap_used_mb	184	2026-06-24 20:18:55.961+00
369	api_avg_response_ms	34	2026-06-24 20:18:55.961+00
370	api_total_requests	17	2026-06-24 20:18:55.961+00
371	cpu_load_1m	0	2026-06-24 20:19:55.966+00
372	memory_percent	97	2026-06-24 20:19:55.966+00
373	heap_used_mb	185	2026-06-24 20:19:55.966+00
374	api_avg_response_ms	128	2026-06-24 20:19:55.966+00
375	api_total_requests	18	2026-06-24 20:19:55.966+00
376	cpu_load_1m	0	2026-06-24 20:20:55.987+00
377	memory_percent	97	2026-06-24 20:20:55.987+00
378	heap_used_mb	185	2026-06-24 20:20:55.987+00
379	api_avg_response_ms	98	2026-06-24 20:20:55.987+00
380	api_total_requests	27	2026-06-24 20:20:55.987+00
381	cpu_load_1m	0	2026-06-24 20:21:55.983+00
382	memory_percent	97	2026-06-24 20:21:55.983+00
383	heap_used_mb	185	2026-06-24 20:21:55.983+00
384	api_avg_response_ms	98	2026-06-24 20:21:55.983+00
385	api_total_requests	27	2026-06-24 20:21:55.983+00
386	cpu_load_1m	0	2026-06-24 20:22:55.985+00
387	memory_percent	97	2026-06-24 20:22:55.985+00
388	heap_used_mb	186	2026-06-24 20:22:55.985+00
389	api_avg_response_ms	98	2026-06-24 20:22:55.985+00
390	api_total_requests	27	2026-06-24 20:22:55.985+00
391	cpu_load_1m	0	2026-06-24 20:23:55.99+00
392	memory_percent	97	2026-06-24 20:23:55.99+00
393	heap_used_mb	185	2026-06-24 20:23:55.99+00
394	api_avg_response_ms	98	2026-06-24 20:23:55.99+00
395	api_total_requests	27	2026-06-24 20:23:55.99+00
396	cpu_load_1m	0	2026-06-24 20:24:56.022+00
397	memory_percent	97	2026-06-24 20:24:56.022+00
398	heap_used_mb	187	2026-06-24 20:24:56.022+00
399	api_avg_response_ms	78	2026-06-24 20:24:56.022+00
400	api_total_requests	45	2026-06-24 20:24:56.022+00
401	cpu_load_1m	0	2026-06-24 20:25:56.023+00
402	memory_percent	98	2026-06-24 20:25:56.023+00
403	heap_used_mb	188	2026-06-24 20:25:56.023+00
404	api_avg_response_ms	75	2026-06-24 20:25:56.023+00
405	api_total_requests	56	2026-06-24 20:25:56.023+00
406	cpu_load_1m	0	2026-06-24 20:26:56.031+00
407	memory_percent	97	2026-06-24 20:26:56.031+00
408	heap_used_mb	188	2026-06-24 20:26:56.031+00
409	api_avg_response_ms	67	2026-06-24 20:26:56.031+00
410	api_total_requests	71	2026-06-24 20:26:56.031+00
411	cpu_load_1m	0	2026-06-24 20:27:56.065+00
412	memory_percent	97	2026-06-24 20:27:56.065+00
413	heap_used_mb	190	2026-06-24 20:27:56.065+00
414	api_avg_response_ms	63	2026-06-24 20:27:56.065+00
415	api_total_requests	93	2026-06-24 20:27:56.065+00
416	cpu_load_1m	0	2026-06-24 20:28:56.061+00
417	memory_percent	97	2026-06-24 20:28:56.061+00
418	heap_used_mb	190	2026-06-24 20:28:56.061+00
419	api_avg_response_ms	61	2026-06-24 20:28:56.061+00
420	api_total_requests	102	2026-06-24 20:28:56.061+00
439	cpu_load_1m	0	2026-06-26 06:44:54.486+00
440	memory_percent	88	2026-06-26 06:44:54.486+00
441	heap_used_mb	204	2026-06-26 06:44:54.486+00
442	api_avg_response_ms	0	2026-06-26 06:44:54.486+00
443	api_total_requests	0	2026-06-26 06:44:54.486+00
444	cpu_load_1m	0	2026-06-26 06:45:54.49+00
445	memory_percent	97	2026-06-26 06:45:54.49+00
446	heap_used_mb	185	2026-06-26 06:45:54.49+00
447	api_avg_response_ms	131	2026-06-26 06:45:54.49+00
448	api_total_requests	33	2026-06-26 06:45:54.49+00
449	cpu_load_1m	0	2026-06-26 06:46:54.498+00
450	memory_percent	97	2026-06-26 06:46:54.498+00
451	heap_used_mb	185	2026-06-26 06:46:54.498+00
452	api_avg_response_ms	103	2026-06-26 06:46:54.498+00
453	api_total_requests	45	2026-06-26 06:46:54.498+00
454	cpu_load_1m	0	2026-06-26 06:47:54.505+00
455	memory_percent	98	2026-06-26 06:47:54.505+00
456	heap_used_mb	186	2026-06-26 06:47:54.505+00
457	api_avg_response_ms	86	2026-06-26 06:47:54.505+00
458	api_total_requests	57	2026-06-26 06:47:54.505+00
459	cpu_load_1m	0	2026-06-26 06:48:54.511+00
460	memory_percent	97	2026-06-26 06:48:54.511+00
461	heap_used_mb	187	2026-06-26 06:48:54.511+00
462	api_avg_response_ms	75	2026-06-26 06:48:54.511+00
463	api_total_requests	73	2026-06-26 06:48:54.511+00
464	cpu_load_1m	0	2026-06-26 06:49:54.519+00
465	memory_percent	97	2026-06-26 06:49:54.519+00
466	heap_used_mb	187	2026-06-26 06:49:54.519+00
467	api_avg_response_ms	72	2026-06-26 06:49:54.519+00
468	api_total_requests	77	2026-06-26 06:49:54.519+00
469	cpu_load_1m	0	2026-06-26 06:50:54.529+00
470	memory_percent	97	2026-06-26 06:50:54.529+00
471	heap_used_mb	187	2026-06-26 06:50:54.529+00
472	api_avg_response_ms	70	2026-06-26 06:50:54.529+00
473	api_total_requests	81	2026-06-26 06:50:54.529+00
474	cpu_load_1m	0	2026-06-26 06:51:54.543+00
475	memory_percent	97	2026-06-26 06:51:54.543+00
476	heap_used_mb	187	2026-06-26 06:51:54.543+00
477	api_avg_response_ms	68	2026-06-26 06:51:54.543+00
478	api_total_requests	83	2026-06-26 06:51:54.543+00
479	cpu_load_1m	0	2026-06-26 06:52:54.556+00
480	memory_percent	98	2026-06-26 06:52:54.556+00
481	heap_used_mb	188	2026-06-26 06:52:54.556+00
482	api_avg_response_ms	68	2026-06-26 06:52:54.556+00
483	api_total_requests	85	2026-06-26 06:52:54.556+00
484	cpu_load_1m	0	2026-06-26 06:53:54.566+00
485	memory_percent	97	2026-06-26 06:53:54.566+00
486	heap_used_mb	187	2026-06-26 06:53:54.566+00
487	api_avg_response_ms	67	2026-06-26 06:53:54.566+00
488	api_total_requests	87	2026-06-26 06:53:54.566+00
489	cpu_load_1m	0	2026-06-26 06:54:54.576+00
490	memory_percent	97	2026-06-26 06:54:54.576+00
491	heap_used_mb	188	2026-06-26 06:54:54.576+00
492	api_avg_response_ms	66	2026-06-26 06:54:54.576+00
493	api_total_requests	89	2026-06-26 06:54:54.576+00
494	cpu_load_1m	0	2026-06-26 06:55:54.564+00
495	memory_percent	98	2026-06-26 06:55:54.564+00
496	heap_used_mb	188	2026-06-26 06:55:54.564+00
497	api_avg_response_ms	64	2026-06-26 06:55:54.564+00
498	api_total_requests	93	2026-06-26 06:55:54.564+00
499	cpu_load_1m	0	2026-06-26 06:56:54.566+00
500	memory_percent	98	2026-06-26 06:56:54.566+00
501	heap_used_mb	189	2026-06-26 06:56:54.566+00
502	api_avg_response_ms	56	2026-06-26 06:56:54.566+00
503	api_total_requests	113	2026-06-26 06:56:54.566+00
504	cpu_load_1m	0	2026-06-26 06:57:54.57+00
505	memory_percent	97	2026-06-26 06:57:54.57+00
506	heap_used_mb	190	2026-06-26 06:57:54.57+00
507	api_avg_response_ms	40	2026-06-26 06:57:54.57+00
508	api_total_requests	163	2026-06-26 06:57:54.57+00
509	cpu_load_1m	0	2026-06-26 06:59:04.546+00
510	memory_percent	89	2026-06-26 06:59:04.546+00
511	heap_used_mb	206	2026-06-26 06:59:04.546+00
512	api_avg_response_ms	0	2026-06-26 06:59:04.546+00
513	api_total_requests	0	2026-06-26 06:59:04.546+00
514	cpu_load_1m	0	2026-06-26 07:00:04.538+00
515	memory_percent	86	2026-06-26 07:00:04.538+00
516	heap_used_mb	201	2026-06-26 07:00:04.538+00
517	api_avg_response_ms	372	2026-06-26 07:00:04.538+00
518	api_total_requests	12	2026-06-26 07:00:04.538+00
519	cpu_load_1m	0	2026-06-26 07:01:04.538+00
520	memory_percent	97	2026-06-26 07:01:04.538+00
521	heap_used_mb	180	2026-06-26 07:01:04.538+00
522	api_avg_response_ms	248	2026-06-26 07:01:04.538+00
523	api_total_requests	26	2026-06-26 07:01:04.538+00
524	cpu_load_1m	0	2026-06-26 07:02:04.531+00
525	memory_percent	97	2026-06-26 07:02:04.531+00
526	heap_used_mb	181	2026-06-26 07:02:04.531+00
527	api_avg_response_ms	223	2026-06-26 07:02:04.531+00
528	api_total_requests	30	2026-06-26 07:02:04.531+00
529	cpu_load_1m	0	2026-06-26 07:03:04.52+00
530	memory_percent	98	2026-06-26 07:03:04.521+00
531	heap_used_mb	181	2026-06-26 07:03:04.521+00
532	api_avg_response_ms	188	2026-06-26 07:03:04.521+00
533	api_total_requests	36	2026-06-26 07:03:04.521+00
534	cpu_load_1m	0	2026-06-26 07:04:04.513+00
535	memory_percent	97	2026-06-26 07:04:04.513+00
536	heap_used_mb	181	2026-06-26 07:04:04.513+00
537	api_avg_response_ms	171	2026-06-26 07:04:04.513+00
538	api_total_requests	40	2026-06-26 07:04:04.513+00
539	cpu_load_1m	0	2026-06-26 07:05:04.512+00
540	memory_percent	97	2026-06-26 07:05:04.512+00
541	heap_used_mb	182	2026-06-26 07:05:04.512+00
542	api_avg_response_ms	132	2026-06-26 07:05:04.512+00
543	api_total_requests	56	2026-06-26 07:05:04.512+00
544	cpu_load_1m	0	2026-06-26 07:06:04.504+00
545	memory_percent	97	2026-06-26 07:06:04.504+00
546	heap_used_mb	182	2026-06-26 07:06:04.504+00
547	api_avg_response_ms	127	2026-06-26 07:06:04.504+00
548	api_total_requests	60	2026-06-26 07:06:04.504+00
549	cpu_load_1m	0	2026-06-26 07:07:04.504+00
550	memory_percent	97	2026-06-26 07:07:04.504+00
551	heap_used_mb	182	2026-06-26 07:07:04.504+00
552	api_avg_response_ms	125	2026-06-26 07:07:04.504+00
553	api_total_requests	64	2026-06-26 07:07:04.504+00
554	cpu_load_1m	0	2026-06-26 07:08:04.5+00
555	memory_percent	97	2026-06-26 07:08:04.5+00
556	heap_used_mb	182	2026-06-26 07:08:04.5+00
557	api_avg_response_ms	122	2026-06-26 07:08:04.5+00
558	api_total_requests	68	2026-06-26 07:08:04.5+00
559	cpu_load_1m	0	2026-06-26 07:09:04.497+00
560	memory_percent	98	2026-06-26 07:09:04.497+00
561	heap_used_mb	183	2026-06-26 07:09:04.497+00
562	api_avg_response_ms	120	2026-06-26 07:09:04.497+00
563	api_total_requests	70	2026-06-26 07:09:04.497+00
564	cpu_load_1m	0	2026-06-26 07:10:04.487+00
565	memory_percent	97	2026-06-26 07:10:04.487+00
566	heap_used_mb	182	2026-06-26 07:10:04.487+00
567	api_avg_response_ms	118	2026-06-26 07:10:04.487+00
568	api_total_requests	72	2026-06-26 07:10:04.487+00
569	cpu_load_1m	0	2026-06-26 07:11:04.485+00
570	memory_percent	97	2026-06-26 07:11:04.485+00
571	heap_used_mb	183	2026-06-26 07:11:04.485+00
572	api_avg_response_ms	116	2026-06-26 07:11:04.485+00
573	api_total_requests	74	2026-06-26 07:11:04.485+00
574	cpu_load_1m	0	2026-06-26 07:12:04.477+00
575	memory_percent	97	2026-06-26 07:12:04.477+00
576	heap_used_mb	183	2026-06-26 07:12:04.477+00
577	api_avg_response_ms	115	2026-06-26 07:12:04.477+00
578	api_total_requests	76	2026-06-26 07:12:04.477+00
579	cpu_load_1m	0	2026-06-26 07:13:04.476+00
580	memory_percent	98	2026-06-26 07:13:04.476+00
581	heap_used_mb	183	2026-06-26 07:13:04.476+00
582	api_avg_response_ms	113	2026-06-26 07:13:04.476+00
583	api_total_requests	78	2026-06-26 07:13:04.476+00
584	cpu_load_1m	0	2026-06-26 07:14:04.471+00
585	memory_percent	98	2026-06-26 07:14:04.471+00
586	heap_used_mb	183	2026-06-26 07:14:04.471+00
587	api_avg_response_ms	112	2026-06-26 07:14:04.471+00
588	api_total_requests	80	2026-06-26 07:14:04.471+00
589	cpu_load_1m	0	2026-06-26 07:15:04.471+00
590	memory_percent	97	2026-06-26 07:15:04.471+00
591	heap_used_mb	183	2026-06-26 07:15:04.471+00
592	api_avg_response_ms	110	2026-06-26 07:15:04.471+00
593	api_total_requests	82	2026-06-26 07:15:04.471+00
594	cpu_load_1m	0	2026-06-26 07:16:04.477+00
595	memory_percent	97	2026-06-26 07:16:04.477+00
596	heap_used_mb	184	2026-06-26 07:16:04.477+00
597	api_avg_response_ms	109	2026-06-26 07:16:04.477+00
598	api_total_requests	84	2026-06-26 07:16:04.477+00
599	cpu_load_1m	0	2026-06-26 07:17:04.477+00
600	memory_percent	97	2026-06-26 07:17:04.477+00
601	heap_used_mb	183	2026-06-26 07:17:04.477+00
602	api_avg_response_ms	106	2026-06-26 07:17:04.477+00
603	api_total_requests	88	2026-06-26 07:17:04.477+00
604	cpu_load_1m	0	2026-06-26 07:18:04.475+00
605	memory_percent	97	2026-06-26 07:18:04.475+00
606	heap_used_mb	184	2026-06-26 07:18:04.475+00
607	api_avg_response_ms	99	2026-06-26 07:18:04.475+00
608	api_total_requests	98	2026-06-26 07:18:04.475+00
609	cpu_load_1m	0	2026-06-26 07:19:04.481+00
610	memory_percent	97	2026-06-26 07:19:04.481+00
611	heap_used_mb	184	2026-06-26 07:19:04.481+00
612	api_avg_response_ms	97	2026-06-26 07:19:04.481+00
613	api_total_requests	102	2026-06-26 07:19:04.481+00
614	cpu_load_1m	0	2026-06-26 07:20:04.473+00
615	memory_percent	98	2026-06-26 07:20:04.473+00
616	heap_used_mb	184	2026-06-26 07:20:04.473+00
617	api_avg_response_ms	95	2026-06-26 07:20:04.473+00
618	api_total_requests	106	2026-06-26 07:20:04.473+00
619	cpu_load_1m	0	2026-06-26 07:21:04.474+00
620	memory_percent	98	2026-06-26 07:21:04.474+00
621	heap_used_mb	185	2026-06-26 07:21:04.474+00
622	api_avg_response_ms	94	2026-06-26 07:21:04.474+00
623	api_total_requests	108	2026-06-26 07:21:04.474+00
624	cpu_load_1m	0	2026-06-26 07:22:04.468+00
625	memory_percent	97	2026-06-26 07:22:04.468+00
626	heap_used_mb	184	2026-06-26 07:22:04.468+00
627	api_avg_response_ms	92	2026-06-26 07:22:04.468+00
628	api_total_requests	112	2026-06-26 07:22:04.468+00
629	cpu_load_1m	0	2026-06-26 07:23:04.467+00
630	memory_percent	98	2026-06-26 07:23:04.467+00
631	heap_used_mb	185	2026-06-26 07:23:04.467+00
632	api_avg_response_ms	91	2026-06-26 07:23:04.467+00
633	api_total_requests	114	2026-06-26 07:23:04.467+00
634	cpu_load_1m	0	2026-06-26 07:24:04.466+00
635	memory_percent	97	2026-06-26 07:24:04.466+00
636	heap_used_mb	184	2026-06-26 07:24:04.466+00
637	api_avg_response_ms	91	2026-06-26 07:24:04.466+00
638	api_total_requests	116	2026-06-26 07:24:04.466+00
639	cpu_load_1m	0	2026-06-26 07:25:04.472+00
640	memory_percent	97	2026-06-26 07:25:04.472+00
641	heap_used_mb	185	2026-06-26 07:25:04.472+00
642	api_avg_response_ms	90	2026-06-26 07:25:04.472+00
643	api_total_requests	118	2026-06-26 07:25:04.472+00
644	cpu_load_1m	0	2026-06-26 07:26:04.475+00
645	memory_percent	97	2026-06-26 07:26:04.475+00
646	heap_used_mb	185	2026-06-26 07:26:04.475+00
647	api_avg_response_ms	89	2026-06-26 07:26:04.475+00
648	api_total_requests	120	2026-06-26 07:26:04.475+00
649	cpu_load_1m	0	2026-06-26 07:27:04.477+00
650	memory_percent	97	2026-06-26 07:27:04.477+00
651	heap_used_mb	185	2026-06-26 07:27:04.477+00
652	api_avg_response_ms	88	2026-06-26 07:27:04.477+00
653	api_total_requests	122	2026-06-26 07:27:04.477+00
654	cpu_load_1m	0	2026-06-26 07:28:04.477+00
655	memory_percent	97	2026-06-26 07:28:04.477+00
656	heap_used_mb	185	2026-06-26 07:28:04.477+00
657	api_avg_response_ms	87	2026-06-26 07:28:04.477+00
658	api_total_requests	124	2026-06-26 07:28:04.477+00
659	cpu_load_1m	0	2026-06-26 07:40:17.622+00
660	memory_percent	97	2026-06-26 07:40:17.622+00
661	heap_used_mb	185	2026-06-26 07:40:17.622+00
662	api_avg_response_ms	87	2026-06-26 07:40:17.622+00
663	api_total_requests	124	2026-06-26 07:40:17.622+00
664	cpu_load_1m	0	2026-06-26 07:46:51.562+00
665	memory_percent	97	2026-06-26 07:46:51.562+00
666	heap_used_mb	186	2026-06-26 07:46:51.562+00
667	api_avg_response_ms	84	2026-06-26 07:46:51.562+00
668	api_total_requests	132	2026-06-26 07:46:51.562+00
669	cpu_load_1m	0	2026-06-26 07:47:51.565+00
670	memory_percent	97	2026-06-26 07:47:51.565+00
671	heap_used_mb	186	2026-06-26 07:47:51.565+00
672	api_avg_response_ms	79	2026-06-26 07:47:51.565+00
673	api_total_requests	142	2026-06-26 07:47:51.565+00
674	cpu_load_1m	0	2026-06-26 07:48:51.579+00
675	memory_percent	97	2026-06-26 07:48:51.579+00
676	heap_used_mb	186	2026-06-26 07:48:51.579+00
677	api_avg_response_ms	78	2026-06-26 07:48:51.579+00
678	api_total_requests	146	2026-06-26 07:48:51.579+00
679	cpu_load_1m	0	2026-06-26 07:49:51.594+00
680	memory_percent	97	2026-06-26 07:49:51.594+00
681	heap_used_mb	187	2026-06-26 07:49:51.594+00
682	api_avg_response_ms	75	2026-06-26 07:49:51.594+00
683	api_total_requests	156	2026-06-26 07:49:51.594+00
684	cpu_load_1m	0	2026-06-26 07:50:51.606+00
685	memory_percent	98	2026-06-26 07:50:51.606+00
686	heap_used_mb	187	2026-06-26 07:50:51.606+00
687	api_avg_response_ms	74	2026-06-26 07:50:51.606+00
688	api_total_requests	163	2026-06-26 07:50:51.606+00
689	cpu_load_1m	0	2026-06-26 07:51:51.62+00
690	memory_percent	97	2026-06-26 07:51:51.62+00
691	heap_used_mb	187	2026-06-26 07:51:51.62+00
692	api_avg_response_ms	74	2026-06-26 07:51:51.62+00
693	api_total_requests	163	2026-06-26 07:51:51.62+00
694	cpu_load_1m	0	2026-06-26 07:52:51.625+00
695	memory_percent	98	2026-06-26 07:52:51.625+00
696	heap_used_mb	187	2026-06-26 07:52:51.625+00
697	api_avg_response_ms	74	2026-06-26 07:52:51.625+00
698	api_total_requests	163	2026-06-26 07:52:51.625+00
699	cpu_load_1m	0	2026-06-26 07:53:51.631+00
700	memory_percent	98	2026-06-26 07:53:51.631+00
701	heap_used_mb	187	2026-06-26 07:53:51.631+00
702	api_avg_response_ms	74	2026-06-26 07:53:51.631+00
703	api_total_requests	163	2026-06-26 07:53:51.631+00
704	cpu_load_1m	0	2026-06-26 07:54:51.64+00
705	memory_percent	97	2026-06-26 07:54:51.64+00
706	heap_used_mb	187	2026-06-26 07:54:51.64+00
707	api_avg_response_ms	74	2026-06-26 07:54:51.64+00
708	api_total_requests	163	2026-06-26 07:54:51.64+00
709	cpu_load_1m	0	2026-06-26 07:55:51.652+00
710	memory_percent	98	2026-06-26 07:55:51.652+00
711	heap_used_mb	187	2026-06-26 07:55:51.652+00
712	api_avg_response_ms	74	2026-06-26 07:55:51.652+00
713	api_total_requests	163	2026-06-26 07:55:51.652+00
714	cpu_load_1m	0	2026-06-26 07:56:51.668+00
715	memory_percent	98	2026-06-26 07:56:51.668+00
716	heap_used_mb	187	2026-06-26 07:56:51.668+00
717	api_avg_response_ms	74	2026-06-26 07:56:51.668+00
718	api_total_requests	163	2026-06-26 07:56:51.668+00
719	cpu_load_1m	0	2026-06-26 07:57:51.678+00
720	memory_percent	97	2026-06-26 07:57:51.678+00
721	heap_used_mb	187	2026-06-26 07:57:51.678+00
722	api_avg_response_ms	74	2026-06-26 07:57:51.678+00
723	api_total_requests	163	2026-06-26 07:57:51.678+00
724	cpu_load_1m	0	2026-06-26 07:58:51.683+00
725	memory_percent	97	2026-06-26 07:58:51.683+00
726	heap_used_mb	187	2026-06-26 07:58:51.683+00
727	api_avg_response_ms	74	2026-06-26 07:58:51.683+00
728	api_total_requests	163	2026-06-26 07:58:51.683+00
729	cpu_load_1m	0	2026-06-26 07:59:51.699+00
730	memory_percent	97	2026-06-26 07:59:51.699+00
731	heap_used_mb	187	2026-06-26 07:59:51.699+00
732	api_avg_response_ms	74	2026-06-26 07:59:51.699+00
733	api_total_requests	163	2026-06-26 07:59:51.699+00
734	cpu_load_1m	0	2026-06-26 08:00:51.705+00
735	memory_percent	97	2026-06-26 08:00:51.705+00
736	heap_used_mb	187	2026-06-26 08:00:51.705+00
737	api_avg_response_ms	74	2026-06-26 08:00:51.705+00
738	api_total_requests	163	2026-06-26 08:00:51.705+00
739	cpu_load_1m	0	2026-06-26 08:01:51.716+00
740	memory_percent	97	2026-06-26 08:01:51.716+00
741	heap_used_mb	187	2026-06-26 08:01:51.716+00
742	api_avg_response_ms	74	2026-06-26 08:01:51.716+00
743	api_total_requests	163	2026-06-26 08:01:51.716+00
744	cpu_load_1m	0	2026-06-26 08:02:51.729+00
745	memory_percent	97	2026-06-26 08:02:51.729+00
746	heap_used_mb	187	2026-06-26 08:02:51.729+00
747	api_avg_response_ms	74	2026-06-26 08:02:51.729+00
748	api_total_requests	163	2026-06-26 08:02:51.729+00
749	cpu_load_1m	0	2026-06-26 08:03:51.742+00
750	memory_percent	98	2026-06-26 08:03:51.742+00
751	heap_used_mb	188	2026-06-26 08:03:51.742+00
752	api_avg_response_ms	74	2026-06-26 08:03:51.742+00
753	api_total_requests	163	2026-06-26 08:03:51.742+00
754	cpu_load_1m	0	2026-06-26 08:04:51.748+00
755	memory_percent	97	2026-06-26 08:04:51.748+00
756	heap_used_mb	187	2026-06-26 08:04:51.748+00
757	api_avg_response_ms	74	2026-06-26 08:04:51.748+00
758	api_total_requests	163	2026-06-26 08:04:51.748+00
759	cpu_load_1m	0	2026-06-26 08:05:51.756+00
760	memory_percent	97	2026-06-26 08:05:51.756+00
761	heap_used_mb	187	2026-06-26 08:05:51.756+00
762	api_avg_response_ms	74	2026-06-26 08:05:51.756+00
763	api_total_requests	163	2026-06-26 08:05:51.756+00
764	cpu_load_1m	0	2026-06-26 08:06:51.77+00
765	memory_percent	98	2026-06-26 08:06:51.77+00
766	heap_used_mb	188	2026-06-26 08:06:51.77+00
767	api_avg_response_ms	74	2026-06-26 08:06:51.77+00
768	api_total_requests	163	2026-06-26 08:06:51.77+00
769	cpu_load_1m	0	2026-06-26 08:07:51.78+00
770	memory_percent	97	2026-06-26 08:07:51.78+00
771	heap_used_mb	187	2026-06-26 08:07:51.78+00
772	api_avg_response_ms	74	2026-06-26 08:07:51.78+00
773	api_total_requests	163	2026-06-26 08:07:51.78+00
774	cpu_load_1m	0	2026-06-26 08:08:51.796+00
775	memory_percent	97	2026-06-26 08:08:51.796+00
776	heap_used_mb	187	2026-06-26 08:08:51.796+00
777	api_avg_response_ms	74	2026-06-26 08:08:51.796+00
778	api_total_requests	163	2026-06-26 08:08:51.796+00
779	cpu_load_1m	0	2026-06-26 08:09:51.813+00
780	memory_percent	98	2026-06-26 08:09:51.813+00
781	heap_used_mb	188	2026-06-26 08:09:51.813+00
782	api_avg_response_ms	74	2026-06-26 08:09:51.813+00
783	api_total_requests	163	2026-06-26 08:09:51.813+00
784	cpu_load_1m	0	2026-06-26 08:10:51.825+00
785	memory_percent	97	2026-06-26 08:10:51.825+00
786	heap_used_mb	187	2026-06-26 08:10:51.825+00
787	api_avg_response_ms	74	2026-06-26 08:10:51.825+00
788	api_total_requests	163	2026-06-26 08:10:51.825+00
789	cpu_load_1m	0	2026-06-26 08:11:51.825+00
790	memory_percent	97	2026-06-26 08:11:51.825+00
791	heap_used_mb	187	2026-06-26 08:11:51.825+00
792	api_avg_response_ms	74	2026-06-26 08:11:51.825+00
793	api_total_requests	163	2026-06-26 08:11:51.825+00
794	cpu_load_1m	0	2026-06-26 08:12:51.83+00
795	memory_percent	98	2026-06-26 08:12:51.83+00
796	heap_used_mb	188	2026-06-26 08:12:51.83+00
797	api_avg_response_ms	74	2026-06-26 08:12:51.83+00
798	api_total_requests	163	2026-06-26 08:12:51.83+00
799	cpu_load_1m	0	2026-06-26 08:13:44.33+00
800	memory_percent	88	2026-06-26 08:13:44.33+00
801	heap_used_mb	205	2026-06-26 08:13:44.33+00
802	api_avg_response_ms	0	2026-06-26 08:13:44.33+00
803	api_total_requests	0	2026-06-26 08:13:44.33+00
804	cpu_load_1m	0	2026-06-26 08:14:35.227+00
805	memory_percent	89	2026-06-26 08:14:35.227+00
806	heap_used_mb	205	2026-06-26 08:14:35.227+00
807	api_avg_response_ms	0	2026-06-26 08:14:35.227+00
808	api_total_requests	0	2026-06-26 08:14:35.227+00
809	cpu_load_1m	0	2026-06-26 08:15:26.568+00
810	memory_percent	88	2026-06-26 08:15:26.568+00
811	heap_used_mb	213	2026-06-26 08:15:26.568+00
812	api_avg_response_ms	0	2026-06-26 08:15:26.568+00
813	api_total_requests	0	2026-06-26 08:15:26.568+00
814	cpu_load_1m	0	2026-06-26 08:16:26.574+00
815	memory_percent	97	2026-06-26 08:16:26.574+00
816	heap_used_mb	188	2026-06-26 08:16:26.574+00
817	api_avg_response_ms	0	2026-06-26 08:16:26.574+00
818	api_total_requests	0	2026-06-26 08:16:26.574+00
819	cpu_load_1m	0	2026-06-26 08:17:26.578+00
820	memory_percent	97	2026-06-26 08:17:26.578+00
821	heap_used_mb	189	2026-06-26 08:17:26.578+00
822	api_avg_response_ms	73	2026-06-26 08:17:26.578+00
823	api_total_requests	3	2026-06-26 08:17:26.578+00
824	cpu_load_1m	0	2026-06-26 08:18:26.583+00
825	memory_percent	98	2026-06-26 08:18:26.583+00
826	heap_used_mb	189	2026-06-26 08:18:26.583+00
827	api_avg_response_ms	73	2026-06-26 08:18:26.583+00
828	api_total_requests	3	2026-06-26 08:18:26.583+00
829	cpu_load_1m	0	2026-06-26 08:19:03.491+00
830	memory_percent	85	2026-06-26 08:19:03.491+00
831	heap_used_mb	207	2026-06-26 08:19:03.491+00
832	api_avg_response_ms	0	2026-06-26 08:19:03.491+00
833	api_total_requests	0	2026-06-26 08:19:03.491+00
834	cpu_load_1m	0	2026-06-26 08:19:28.469+00
835	memory_percent	87	2026-06-26 08:19:28.469+00
836	heap_used_mb	212	2026-06-26 08:19:28.469+00
837	api_avg_response_ms	0	2026-06-26 08:19:28.469+00
838	api_total_requests	0	2026-06-26 08:19:28.469+00
839	cpu_load_1m	0	2026-06-26 08:44:15.387+00
840	memory_percent	90	2026-06-26 08:44:15.387+00
841	heap_used_mb	221	2026-06-26 08:44:15.387+00
842	api_avg_response_ms	0	2026-06-26 08:44:15.387+00
843	api_total_requests	0	2026-06-26 08:44:15.387+00
844	cpu_load_1m	0	2026-06-26 08:45:15.403+00
845	memory_percent	97	2026-06-26 08:45:15.403+00
846	heap_used_mb	190	2026-06-26 08:45:15.403+00
847	api_avg_response_ms	0	2026-06-26 08:45:15.403+00
848	api_total_requests	0	2026-06-26 08:45:15.403+00
849	cpu_load_1m	0	2026-06-26 08:46:15.405+00
850	memory_percent	97	2026-06-26 08:46:15.405+00
851	heap_used_mb	191	2026-06-26 08:46:15.405+00
852	api_avg_response_ms	0	2026-06-26 08:46:15.405+00
853	api_total_requests	0	2026-06-26 08:46:15.405+00
854	cpu_load_1m	0	2026-06-26 08:47:15.417+00
855	memory_percent	96	2026-06-26 08:47:15.417+00
856	heap_used_mb	191	2026-06-26 08:47:15.417+00
857	api_avg_response_ms	0	2026-06-26 08:47:15.417+00
858	api_total_requests	0	2026-06-26 08:47:15.417+00
859	cpu_load_1m	0	2026-06-26 08:48:15.421+00
860	memory_percent	97	2026-06-26 08:48:15.421+00
861	heap_used_mb	190	2026-06-26 08:48:15.421+00
862	api_avg_response_ms	0	2026-06-26 08:48:15.421+00
863	api_total_requests	0	2026-06-26 08:48:15.421+00
864	cpu_load_1m	0	2026-06-26 08:49:15.428+00
865	memory_percent	97	2026-06-26 08:49:15.428+00
866	heap_used_mb	191	2026-06-26 08:49:15.428+00
867	api_avg_response_ms	0	2026-06-26 08:49:15.428+00
868	api_total_requests	0	2026-06-26 08:49:15.428+00
869	cpu_load_1m	0	2026-06-26 08:50:15.444+00
870	memory_percent	97	2026-06-26 08:50:15.444+00
871	heap_used_mb	191	2026-06-26 08:50:15.444+00
872	api_avg_response_ms	0	2026-06-26 08:50:15.444+00
873	api_total_requests	0	2026-06-26 08:50:15.444+00
874	cpu_load_1m	0	2026-06-26 08:51:15.457+00
875	memory_percent	97	2026-06-26 08:51:15.457+00
876	heap_used_mb	191	2026-06-26 08:51:15.457+00
877	api_avg_response_ms	0	2026-06-26 08:51:15.457+00
878	api_total_requests	0	2026-06-26 08:51:15.457+00
879	cpu_load_1m	0	2026-06-26 08:52:15.457+00
880	memory_percent	97	2026-06-26 08:52:15.457+00
881	heap_used_mb	191	2026-06-26 08:52:15.457+00
882	api_avg_response_ms	0	2026-06-26 08:52:15.457+00
883	api_total_requests	0	2026-06-26 08:52:15.457+00
884	cpu_load_1m	0	2026-06-26 08:53:15.464+00
885	memory_percent	97	2026-06-26 08:53:15.464+00
886	heap_used_mb	191	2026-06-26 08:53:15.464+00
887	api_avg_response_ms	0	2026-06-26 08:53:15.464+00
888	api_total_requests	0	2026-06-26 08:53:15.464+00
889	cpu_load_1m	0	2026-06-26 08:54:15.47+00
890	memory_percent	97	2026-06-26 08:54:15.47+00
891	heap_used_mb	191	2026-06-26 08:54:15.47+00
892	api_avg_response_ms	0	2026-06-26 08:54:15.47+00
893	api_total_requests	0	2026-06-26 08:54:15.47+00
894	cpu_load_1m	0	2026-06-26 08:55:43.087+00
895	memory_percent	97	2026-06-26 08:55:43.087+00
896	heap_used_mb	191	2026-06-26 08:55:43.087+00
897	api_avg_response_ms	0	2026-06-26 08:55:43.087+00
898	api_total_requests	0	2026-06-26 08:55:43.087+00
899	cpu_load_1m	0	2026-06-26 08:56:43.095+00
900	memory_percent	97	2026-06-26 08:56:43.095+00
901	heap_used_mb	192	2026-06-26 08:56:43.095+00
902	api_avg_response_ms	111	2026-06-26 08:56:43.095+00
903	api_total_requests	8	2026-06-26 08:56:43.095+00
904	cpu_load_1m	0	2026-06-26 08:57:43.107+00
905	memory_percent	97	2026-06-26 08:57:43.107+00
906	heap_used_mb	193	2026-06-26 08:57:43.107+00
907	api_avg_response_ms	111	2026-06-26 08:57:43.107+00
908	api_total_requests	8	2026-06-26 08:57:43.107+00
909	cpu_load_1m	0	2026-06-26 08:58:43.109+00
910	memory_percent	97	2026-06-26 08:58:43.109+00
911	heap_used_mb	192	2026-06-26 08:58:43.109+00
912	api_avg_response_ms	111	2026-06-26 08:58:43.109+00
913	api_total_requests	8	2026-06-26 08:58:43.109+00
914	cpu_load_1m	0	2026-06-26 08:59:43.118+00
915	memory_percent	97	2026-06-26 08:59:43.118+00
916	heap_used_mb	193	2026-06-26 08:59:43.118+00
917	api_avg_response_ms	111	2026-06-26 08:59:43.118+00
918	api_total_requests	8	2026-06-26 08:59:43.118+00
919	cpu_load_1m	0	2026-06-26 09:00:43.123+00
920	memory_percent	97	2026-06-26 09:00:43.123+00
921	heap_used_mb	193	2026-06-26 09:00:43.123+00
922	api_avg_response_ms	111	2026-06-26 09:00:43.123+00
923	api_total_requests	8	2026-06-26 09:00:43.123+00
924	cpu_load_1m	0	2026-06-26 09:01:43.127+00
925	memory_percent	98	2026-06-26 09:01:43.127+00
926	heap_used_mb	193	2026-06-26 09:01:43.127+00
927	api_avg_response_ms	111	2026-06-26 09:01:43.127+00
928	api_total_requests	8	2026-06-26 09:01:43.127+00
929	cpu_load_1m	0	2026-06-26 09:02:43.136+00
930	memory_percent	97	2026-06-26 09:02:43.136+00
931	heap_used_mb	193	2026-06-26 09:02:43.136+00
932	api_avg_response_ms	111	2026-06-26 09:02:43.136+00
933	api_total_requests	8	2026-06-26 09:02:43.136+00
934	cpu_load_1m	0	2026-06-26 09:03:43.147+00
935	memory_percent	97	2026-06-26 09:03:43.147+00
936	heap_used_mb	192	2026-06-26 09:03:43.147+00
937	api_avg_response_ms	111	2026-06-26 09:03:43.147+00
938	api_total_requests	8	2026-06-26 09:03:43.147+00
939	cpu_load_1m	0	2026-06-26 09:04:43.156+00
940	memory_percent	97	2026-06-26 09:04:43.156+00
941	heap_used_mb	193	2026-06-26 09:04:43.156+00
942	api_avg_response_ms	111	2026-06-26 09:04:43.156+00
943	api_total_requests	8	2026-06-26 09:04:43.156+00
944	cpu_load_1m	0	2026-06-26 09:05:43.169+00
945	memory_percent	97	2026-06-26 09:05:43.169+00
946	heap_used_mb	193	2026-06-26 09:05:43.169+00
947	api_avg_response_ms	111	2026-06-26 09:05:43.169+00
948	api_total_requests	8	2026-06-26 09:05:43.169+00
949	cpu_load_1m	0	2026-06-26 09:06:50.227+00
950	memory_percent	89	2026-06-26 09:06:50.227+00
951	heap_used_mb	219	2026-06-26 09:06:50.227+00
952	api_avg_response_ms	0	2026-06-26 09:06:50.227+00
953	api_total_requests	0	2026-06-26 09:06:50.227+00
954	cpu_load_1m	0	2026-06-26 09:07:50.237+00
955	memory_percent	97	2026-06-26 09:07:50.237+00
956	heap_used_mb	191	2026-06-26 09:07:50.237+00
957	api_avg_response_ms	82	2026-06-26 09:07:50.237+00
958	api_total_requests	8	2026-06-26 09:07:50.237+00
959	cpu_load_1m	0	2026-06-26 09:08:50.245+00
960	memory_percent	97	2026-06-26 09:08:50.245+00
961	heap_used_mb	192	2026-06-26 09:08:50.245+00
962	api_avg_response_ms	75	2026-06-26 09:08:50.245+00
963	api_total_requests	17	2026-06-26 09:08:50.245+00
964	cpu_load_1m	0	2026-06-26 09:09:50.252+00
965	memory_percent	98	2026-06-26 09:09:50.252+00
966	heap_used_mb	194	2026-06-26 09:09:50.252+00
967	api_avg_response_ms	71	2026-06-26 09:09:50.252+00
968	api_total_requests	29	2026-06-26 09:09:50.252+00
969	cpu_load_1m	0	2026-06-26 09:10:50.255+00
970	memory_percent	97	2026-06-26 09:10:50.255+00
971	heap_used_mb	193	2026-06-26 09:10:50.255+00
972	api_avg_response_ms	71	2026-06-26 09:10:50.255+00
973	api_total_requests	29	2026-06-26 09:10:50.255+00
974	cpu_load_1m	0	2026-06-26 09:11:50.265+00
975	memory_percent	97	2026-06-26 09:11:50.265+00
976	heap_used_mb	193	2026-06-26 09:11:50.265+00
977	api_avg_response_ms	71	2026-06-26 09:11:50.265+00
978	api_total_requests	29	2026-06-26 09:11:50.265+00
979	cpu_load_1m	0	2026-06-26 09:12:50.269+00
980	memory_percent	98	2026-06-26 09:12:50.269+00
981	heap_used_mb	194	2026-06-26 09:12:50.269+00
982	api_avg_response_ms	71	2026-06-26 09:12:50.269+00
983	api_total_requests	29	2026-06-26 09:12:50.269+00
984	cpu_load_1m	0	2026-06-26 09:13:50.272+00
985	memory_percent	97	2026-06-26 09:13:50.272+00
986	heap_used_mb	193	2026-06-26 09:13:50.272+00
987	api_avg_response_ms	71	2026-06-26 09:13:50.272+00
988	api_total_requests	29	2026-06-26 09:13:50.272+00
989	cpu_load_1m	0	2026-06-26 09:14:50.275+00
990	memory_percent	98	2026-06-26 09:14:50.275+00
991	heap_used_mb	194	2026-06-26 09:14:50.275+00
992	api_avg_response_ms	71	2026-06-26 09:14:50.275+00
993	api_total_requests	29	2026-06-26 09:14:50.275+00
994	cpu_load_1m	0	2026-06-26 09:15:50.276+00
995	memory_percent	97	2026-06-26 09:15:50.276+00
996	heap_used_mb	194	2026-06-26 09:15:50.276+00
997	api_avg_response_ms	71	2026-06-26 09:15:50.276+00
998	api_total_requests	29	2026-06-26 09:15:50.276+00
999	cpu_load_1m	0	2026-06-26 09:16:50.289+00
1000	memory_percent	97	2026-06-26 09:16:50.289+00
1001	heap_used_mb	193	2026-06-26 09:16:50.289+00
1002	api_avg_response_ms	71	2026-06-26 09:16:50.289+00
1003	api_total_requests	29	2026-06-26 09:16:50.289+00
1004	cpu_load_1m	0	2026-06-26 09:17:50.295+00
1005	memory_percent	97	2026-06-26 09:17:50.295+00
1006	heap_used_mb	194	2026-06-26 09:17:50.295+00
1007	api_avg_response_ms	71	2026-06-26 09:17:50.295+00
1008	api_total_requests	29	2026-06-26 09:17:50.295+00
1009	cpu_load_1m	0	2026-06-26 09:18:50.307+00
1010	memory_percent	97	2026-06-26 09:18:50.307+00
1011	heap_used_mb	193	2026-06-26 09:18:50.307+00
1012	api_avg_response_ms	71	2026-06-26 09:18:50.307+00
1013	api_total_requests	29	2026-06-26 09:18:50.307+00
1014	cpu_load_1m	0	2026-06-26 09:19:50.321+00
1015	memory_percent	98	2026-06-26 09:19:50.321+00
1016	heap_used_mb	194	2026-06-26 09:19:50.321+00
1017	api_avg_response_ms	71	2026-06-26 09:19:50.321+00
1018	api_total_requests	29	2026-06-26 09:19:50.321+00
1019	cpu_load_1m	0	2026-06-26 09:30:10.714+00
1020	memory_percent	97	2026-06-26 09:30:10.714+00
1021	heap_used_mb	194	2026-06-26 09:30:10.714+00
1022	api_avg_response_ms	71	2026-06-26 09:30:10.714+00
1023	api_total_requests	29	2026-06-26 09:30:10.714+00
1024	cpu_load_1m	0	2026-06-26 09:31:10.579+00
1025	memory_percent	97	2026-06-26 09:31:10.579+00
1026	heap_used_mb	196	2026-06-26 09:31:10.579+00
1027	api_avg_response_ms	69	2026-06-26 09:31:10.579+00
1028	api_total_requests	43	2026-06-26 09:31:10.579+00
1029	cpu_load_1m	0	2026-06-26 09:32:10.584+00
1030	memory_percent	97	2026-06-26 09:32:10.584+00
1031	heap_used_mb	197	2026-06-26 09:32:10.584+00
1032	api_avg_response_ms	64	2026-06-26 09:32:10.584+00
1033	api_total_requests	49	2026-06-26 09:32:10.584+00
1034	cpu_load_1m	0	2026-06-26 09:33:10.588+00
1035	memory_percent	97	2026-06-26 09:33:10.588+00
1036	heap_used_mb	198	2026-06-26 09:33:10.588+00
1037	api_avg_response_ms	50	2026-06-26 09:33:10.588+00
1038	api_total_requests	74	2026-06-26 09:33:10.588+00
1039	cpu_load_1m	0	2026-06-26 09:34:10.598+00
1040	memory_percent	97	2026-06-26 09:34:10.598+00
1041	heap_used_mb	199	2026-06-26 09:34:10.598+00
1042	api_avg_response_ms	131	2026-06-26 09:34:10.598+00
1043	api_total_requests	81	2026-06-26 09:34:10.598+00
1044	cpu_load_1m	0	2026-06-26 09:35:10.599+00
1045	memory_percent	97	2026-06-26 09:35:10.599+00
1046	heap_used_mb	199	2026-06-26 09:35:10.599+00
1047	api_avg_response_ms	156	2026-06-26 09:35:10.599+00
1048	api_total_requests	82	2026-06-26 09:35:10.599+00
1049	cpu_load_1m	0	2026-06-26 09:36:10.606+00
1050	memory_percent	98	2026-06-26 09:36:10.606+00
1051	heap_used_mb	200	2026-06-26 09:36:10.606+00
1052	api_avg_response_ms	156	2026-06-26 09:36:10.606+00
1053	api_total_requests	82	2026-06-26 09:36:10.606+00
1054	cpu_load_1m	0	2026-06-26 09:36:49.776+00
1055	memory_percent	86	2026-06-26 09:36:49.776+00
1056	heap_used_mb	211	2026-06-26 09:36:49.776+00
1057	api_avg_response_ms	0	2026-06-26 09:36:49.776+00
1058	api_total_requests	0	2026-06-26 09:36:49.776+00
1059	cpu_load_1m	0	2026-06-26 09:37:49.796+00
1060	memory_percent	97	2026-06-26 09:37:49.796+00
1061	heap_used_mb	191	2026-06-26 09:37:49.796+00
1062	api_avg_response_ms	0	2026-06-26 09:37:49.796+00
1063	api_total_requests	0	2026-06-26 09:37:49.796+00
1064	cpu_load_1m	0	2026-06-26 09:38:49.797+00
1065	memory_percent	97	2026-06-26 09:38:49.797+00
1066	heap_used_mb	191	2026-06-26 09:38:49.797+00
1067	api_avg_response_ms	0	2026-06-26 09:38:49.797+00
1068	api_total_requests	0	2026-06-26 09:38:49.797+00
1069	cpu_load_1m	0	2026-06-26 09:39:49.8+00
1070	memory_percent	97	2026-06-26 09:39:49.8+00
1071	heap_used_mb	191	2026-06-26 09:39:49.8+00
1072	api_avg_response_ms	0	2026-06-26 09:39:49.8+00
1073	api_total_requests	0	2026-06-26 09:39:49.8+00
1074	cpu_load_1m	0	2026-06-26 09:40:49.813+00
1075	memory_percent	97	2026-06-26 09:40:49.813+00
1076	heap_used_mb	191	2026-06-26 09:40:49.813+00
1077	api_avg_response_ms	0	2026-06-26 09:40:49.813+00
1078	api_total_requests	0	2026-06-26 09:40:49.813+00
1079	cpu_load_1m	0	2026-06-26 09:41:49.817+00
1080	memory_percent	98	2026-06-26 09:41:49.817+00
1081	heap_used_mb	192	2026-06-26 09:41:49.817+00
1082	api_avg_response_ms	0	2026-06-26 09:41:49.817+00
1083	api_total_requests	0	2026-06-26 09:41:49.817+00
1084	cpu_load_1m	0	2026-06-26 09:42:49.822+00
1085	memory_percent	97	2026-06-26 09:42:49.822+00
1086	heap_used_mb	192	2026-06-26 09:42:49.822+00
1087	api_avg_response_ms	0	2026-06-26 09:42:49.822+00
1088	api_total_requests	0	2026-06-26 09:42:49.822+00
1089	cpu_load_1m	0	2026-06-26 09:43:49.829+00
1090	memory_percent	97	2026-06-26 09:43:49.829+00
1091	heap_used_mb	191	2026-06-26 09:43:49.829+00
1092	api_avg_response_ms	0	2026-06-26 09:43:49.829+00
1093	api_total_requests	0	2026-06-26 09:43:49.829+00
1094	cpu_load_1m	0	2026-06-26 09:44:49.829+00
1095	memory_percent	98	2026-06-26 09:44:49.829+00
1096	heap_used_mb	193	2026-06-26 09:44:49.829+00
1097	api_avg_response_ms	2126	2026-06-26 09:44:49.829+00
1098	api_total_requests	1	2026-06-26 09:44:49.829+00
1099	cpu_load_1m	0	2026-06-26 09:45:49.831+00
1100	memory_percent	97	2026-06-26 09:45:49.831+00
1101	heap_used_mb	193	2026-06-26 09:45:49.831+00
1102	api_avg_response_ms	2398	2026-06-26 09:45:49.831+00
1103	api_total_requests	2	2026-06-26 09:45:49.831+00
1104	cpu_load_1m	0	2026-06-26 09:46:23.554+00
1105	memory_percent	88	2026-06-26 09:46:23.554+00
1106	heap_used_mb	216	2026-06-26 09:46:23.554+00
1107	api_avg_response_ms	0	2026-06-26 09:46:23.554+00
1108	api_total_requests	0	2026-06-26 09:46:23.554+00
1109	cpu_load_1m	0	2026-06-26 09:47:23.567+00
1110	memory_percent	97	2026-06-26 09:47:23.567+00
1111	heap_used_mb	192	2026-06-26 09:47:23.567+00
1112	api_avg_response_ms	577	2026-06-26 09:47:23.567+00
1113	api_total_requests	5	2026-06-26 09:47:23.567+00
1114	cpu_load_1m	0	2026-06-26 09:48:23.568+00
1115	memory_percent	97	2026-06-26 09:48:23.568+00
1116	heap_used_mb	193	2026-06-26 09:48:23.568+00
1117	api_avg_response_ms	789	2026-06-26 09:48:23.568+00
1118	api_total_requests	6	2026-06-26 09:48:23.568+00
1119	cpu_load_1m	0	2026-06-26 09:49:23.572+00
1120	memory_percent	97	2026-06-26 09:49:23.572+00
1121	heap_used_mb	192	2026-06-26 09:49:23.572+00
1122	api_avg_response_ms	789	2026-06-26 09:49:23.572+00
1123	api_total_requests	6	2026-06-26 09:49:23.572+00
1124	cpu_load_1m	0	2026-06-26 09:49:46.984+00
1125	memory_percent	88	2026-06-26 09:49:46.984+00
1126	heap_used_mb	215	2026-06-26 09:49:46.984+00
1127	api_avg_response_ms	0	2026-06-26 09:49:46.984+00
1128	api_total_requests	0	2026-06-26 09:49:46.984+00
1129	cpu_load_1m	0	2026-06-26 09:50:46.997+00
1130	memory_percent	97	2026-06-26 09:50:46.997+00
1131	heap_used_mb	191	2026-06-26 09:50:46.997+00
1132	api_avg_response_ms	0	2026-06-26 09:50:46.997+00
1133	api_total_requests	0	2026-06-26 09:50:46.997+00
1134	cpu_load_1m	0	2026-06-26 09:51:29.618+00
1135	memory_percent	90	2026-06-26 09:51:29.618+00
1136	heap_used_mb	221	2026-06-26 09:51:29.618+00
1137	api_avg_response_ms	0	2026-06-26 09:51:29.618+00
1138	api_total_requests	0	2026-06-26 09:51:29.618+00
1139	cpu_load_1m	0	2026-06-26 09:52:29.625+00
1140	memory_percent	97	2026-06-26 09:52:29.625+00
1141	heap_used_mb	192	2026-06-26 09:52:29.625+00
1142	api_avg_response_ms	871	2026-06-26 09:52:29.625+00
1143	api_total_requests	5	2026-06-26 09:52:29.625+00
1144	cpu_load_1m	0	2026-06-26 09:53:29.636+00
1145	memory_percent	97	2026-06-26 09:53:29.636+00
1146	heap_used_mb	193	2026-06-26 09:53:29.636+00
1147	api_avg_response_ms	1392	2026-06-26 09:53:29.636+00
1148	api_total_requests	6	2026-06-26 09:53:29.636+00
1149	cpu_load_1m	0	2026-06-26 09:54:29.641+00
1150	memory_percent	97	2026-06-26 09:54:29.641+00
1151	heap_used_mb	192	2026-06-26 09:54:29.641+00
1152	api_avg_response_ms	1392	2026-06-26 09:54:29.641+00
1153	api_total_requests	6	2026-06-26 09:54:29.641+00
1154	cpu_load_1m	0	2026-06-26 09:55:29.644+00
1155	memory_percent	97	2026-06-26 09:55:29.644+00
1156	heap_used_mb	193	2026-06-26 09:55:29.644+00
1157	api_avg_response_ms	1392	2026-06-26 09:55:29.644+00
1158	api_total_requests	6	2026-06-26 09:55:29.644+00
1159	cpu_load_1m	0	2026-06-26 09:56:29.645+00
1160	memory_percent	97	2026-06-26 09:56:29.645+00
1161	heap_used_mb	193	2026-06-26 09:56:29.645+00
1162	api_avg_response_ms	1392	2026-06-26 09:56:29.645+00
1163	api_total_requests	6	2026-06-26 09:56:29.645+00
1164	cpu_load_1m	0	2026-06-26 09:57:29.653+00
1165	memory_percent	97	2026-06-26 09:57:29.653+00
1166	heap_used_mb	193	2026-06-26 09:57:29.653+00
1167	api_avg_response_ms	1392	2026-06-26 09:57:29.653+00
1168	api_total_requests	6	2026-06-26 09:57:29.653+00
1169	cpu_load_1m	0	2026-06-26 09:58:29.654+00
1170	memory_percent	97	2026-06-26 09:58:29.654+00
1171	heap_used_mb	193	2026-06-26 09:58:29.654+00
1172	api_avg_response_ms	1211	2026-06-26 09:58:29.654+00
1173	api_total_requests	7	2026-06-26 09:58:29.654+00
1174	cpu_load_1m	0	2026-06-26 09:59:29.665+00
1175	memory_percent	98	2026-06-26 09:59:29.665+00
1176	heap_used_mb	195	2026-06-26 09:59:29.665+00
1177	api_avg_response_ms	545	2026-06-26 09:59:29.665+00
1178	api_total_requests	17	2026-06-26 09:59:29.665+00
1179	cpu_load_1m	0	2026-06-26 10:00:29.675+00
1180	memory_percent	97	2026-06-26 10:00:29.675+00
1181	heap_used_mb	194	2026-06-26 10:00:29.675+00
1182	api_avg_response_ms	545	2026-06-26 10:00:29.675+00
1183	api_total_requests	17	2026-06-26 10:00:29.675+00
1184	cpu_load_1m	0	2026-06-26 10:01:29.684+00
1185	memory_percent	97	2026-06-26 10:01:29.684+00
1186	heap_used_mb	194	2026-06-26 10:01:29.684+00
1187	api_avg_response_ms	545	2026-06-26 10:01:29.684+00
1188	api_total_requests	17	2026-06-26 10:01:29.684+00
1189	cpu_load_1m	0	2026-06-26 10:02:29.69+00
1190	memory_percent	97	2026-06-26 10:02:29.69+00
1191	heap_used_mb	195	2026-06-26 10:02:29.69+00
1192	api_avg_response_ms	545	2026-06-26 10:02:29.69+00
1193	api_total_requests	17	2026-06-26 10:02:29.69+00
1194	cpu_load_1m	0	2026-06-26 10:03:29.702+00
1195	memory_percent	97	2026-06-26 10:03:29.702+00
1196	heap_used_mb	194	2026-06-26 10:03:29.702+00
1197	api_avg_response_ms	545	2026-06-26 10:03:29.702+00
1198	api_total_requests	17	2026-06-26 10:03:29.702+00
1199	cpu_load_1m	0	2026-06-26 10:08:35.675+00
1200	memory_percent	97	2026-06-26 10:08:35.675+00
1201	heap_used_mb	195	2026-06-26 10:08:35.675+00
1202	api_avg_response_ms	0	2026-06-26 10:08:35.675+00
1203	api_total_requests	0	2026-06-26 10:08:35.675+00
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.system_settings (id, key, value, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, "passwordHash", role, "isVerified", "createdAt", "updatedAt", "firstName", "lastName", status, "verificationToken", "lastLogin") FROM stdin;
2	prathamjain601@gmail.com	$2b$10$yXszlD.K4fSsPN65OOxzXu.X.6V43Rv6/O93o07KYFDy.dJGmY4N6	Admin	f	2026-06-22 13:38:01.712+00	2026-06-22 13:44:37.922+00	Pratham	Jain	active	a5f0019a2e7ae6d1e4fa076a22c23ddfa5438dec2ec5c9465ecd7995c0890f5b	2026-06-22 13:44:37.922+00
3	admin.test@realwayaura.com	$2b$10$ht2v6NmBgYpBj8Uk8/v0o.7juHwIGA.Nllkiel1z5vpOhkJqE50kS	Admin	t	2026-06-22 14:38:52.918+00	2026-06-22 14:38:52.918+00	John	Doe	active	\N	\N
4	manager.test@realwayaura.com	$2b$10$VwX3CgyizNXjxaV2XJ.5Y.9qguyVW6GprnfKY0qqjhG24/I6IYNDu	Manager	t	2026-06-22 14:38:53+00	2026-06-22 14:38:53+00	Jane	Smith	active	\N	\N
6	user2.test@realwayaura.com	$2b$10$gNEQOKSPFQlGWsYWiqF.t.MRQPZdkpo9rcU0lqnYwkQSA1X8GyKLe	User	t	2026-06-22 14:38:53.159+00	2026-06-22 14:38:53.159+00	Bob	Brown	active	\N	\N
5	user1.test@realwayaura.com	$2b$10$V8IeeNjLFyvMLaOPc62Q1e5vx1ocbLDKzoOLAkP8CMlmwlGBw2lVu	User	t	2026-06-22 14:38:53.073+00	2026-06-22 14:42:46.905+00	Alice	Johnson	banned	\N	\N
7	tanvikamath22@gmail.com	$2b$10$gjGkuQWDgQ5k2f.rhokK9O4.DkG/78.oPtxbRtly3z9L.TYOIvU7q	Admin	f	2026-06-24 20:19:50.225+00	2026-06-26 06:45:13.801+00	tanvi	javan	active	cf12d664a00c668dae0e3bff6c77cb37dbd4eb83f82dc362a7dc6719773d95b3	2026-06-26 06:45:13.8+00
\.


--
-- Name: api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.api_keys_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 15, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 3, true);


--
-- Name: error_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.error_logs_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.notifications_id_seq', 196, true);


--
-- Name: post_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.post_versions_id_seq', 1, false);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.posts_id_seq', 2, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.sessions_id_seq', 6, true);


--
-- Name: system_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.system_metrics_id_seq', 1203, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: api_keys api_keys_key_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key UNIQUE (key);


--
-- Name: api_keys api_keys_key_key1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key1 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key10; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key10 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key11; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key11 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key12; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key12 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key13; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key13 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key14; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key14 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key15; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key15 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key16; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key16 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key17; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key17 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key18; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key18 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key19; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key19 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key2 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key20; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key20 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key21; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key21 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key22; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key22 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key3 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key4 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key5 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key6 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key7 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key8; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key8 UNIQUE (key);


--
-- Name: api_keys api_keys_key_key9; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_key9 UNIQUE (key);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_name_key1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key1 UNIQUE (name);


--
-- Name: categories categories_name_key10; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key10 UNIQUE (name);


--
-- Name: categories categories_name_key11; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key11 UNIQUE (name);


--
-- Name: categories categories_name_key12; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key12 UNIQUE (name);


--
-- Name: categories categories_name_key13; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key13 UNIQUE (name);


--
-- Name: categories categories_name_key14; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key14 UNIQUE (name);


--
-- Name: categories categories_name_key15; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key15 UNIQUE (name);


--
-- Name: categories categories_name_key16; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key16 UNIQUE (name);


--
-- Name: categories categories_name_key17; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key17 UNIQUE (name);


--
-- Name: categories categories_name_key18; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key18 UNIQUE (name);


--
-- Name: categories categories_name_key19; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key19 UNIQUE (name);


--
-- Name: categories categories_name_key2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key2 UNIQUE (name);


--
-- Name: categories categories_name_key20; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key20 UNIQUE (name);


--
-- Name: categories categories_name_key21; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key21 UNIQUE (name);


--
-- Name: categories categories_name_key22; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key22 UNIQUE (name);


--
-- Name: categories categories_name_key23; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key23 UNIQUE (name);


--
-- Name: categories categories_name_key3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key3 UNIQUE (name);


--
-- Name: categories categories_name_key4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key4 UNIQUE (name);


--
-- Name: categories categories_name_key5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key5 UNIQUE (name);


--
-- Name: categories categories_name_key6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key6 UNIQUE (name);


--
-- Name: categories categories_name_key7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key7 UNIQUE (name);


--
-- Name: categories categories_name_key8; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key8 UNIQUE (name);


--
-- Name: categories categories_name_key9; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key9 UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: categories categories_slug_key1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key1 UNIQUE (slug);


--
-- Name: categories categories_slug_key10; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key10 UNIQUE (slug);


--
-- Name: categories categories_slug_key11; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key11 UNIQUE (slug);


--
-- Name: categories categories_slug_key12; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key12 UNIQUE (slug);


--
-- Name: categories categories_slug_key13; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key13 UNIQUE (slug);


--
-- Name: categories categories_slug_key14; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key14 UNIQUE (slug);


--
-- Name: categories categories_slug_key15; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key15 UNIQUE (slug);


--
-- Name: categories categories_slug_key16; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key16 UNIQUE (slug);


--
-- Name: categories categories_slug_key17; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key17 UNIQUE (slug);


--
-- Name: categories categories_slug_key18; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key18 UNIQUE (slug);


--
-- Name: categories categories_slug_key2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key2 UNIQUE (slug);


--
-- Name: categories categories_slug_key3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key3 UNIQUE (slug);


--
-- Name: categories categories_slug_key4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key4 UNIQUE (slug);


--
-- Name: categories categories_slug_key5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key5 UNIQUE (slug);


--
-- Name: categories categories_slug_key6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key6 UNIQUE (slug);


--
-- Name: categories categories_slug_key7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key7 UNIQUE (slug);


--
-- Name: categories categories_slug_key8; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key8 UNIQUE (slug);


--
-- Name: categories categories_slug_key9; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key9 UNIQUE (slug);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: error_logs error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.error_logs
    ADD CONSTRAINT error_logs_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: post_versions post_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.post_versions
    ADD CONSTRAINT post_versions_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key UNIQUE (slug);


--
-- Name: posts posts_slug_key1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key1 UNIQUE (slug);


--
-- Name: posts posts_slug_key10; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key10 UNIQUE (slug);


--
-- Name: posts posts_slug_key11; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key11 UNIQUE (slug);


--
-- Name: posts posts_slug_key12; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key12 UNIQUE (slug);


--
-- Name: posts posts_slug_key13; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key13 UNIQUE (slug);


--
-- Name: posts posts_slug_key14; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key14 UNIQUE (slug);


--
-- Name: posts posts_slug_key15; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key15 UNIQUE (slug);


--
-- Name: posts posts_slug_key16; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key16 UNIQUE (slug);


--
-- Name: posts posts_slug_key17; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key17 UNIQUE (slug);


--
-- Name: posts posts_slug_key18; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key18 UNIQUE (slug);


--
-- Name: posts posts_slug_key2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key2 UNIQUE (slug);


--
-- Name: posts posts_slug_key3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key3 UNIQUE (slug);


--
-- Name: posts posts_slug_key4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key4 UNIQUE (slug);


--
-- Name: posts posts_slug_key5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key5 UNIQUE (slug);


--
-- Name: posts posts_slug_key6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key6 UNIQUE (slug);


--
-- Name: posts posts_slug_key7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key7 UNIQUE (slug);


--
-- Name: posts posts_slug_key8; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key8 UNIQUE (slug);


--
-- Name: posts posts_slug_key9; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_slug_key9 UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (token);


--
-- Name: sessions sessions_token_key1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key1 UNIQUE (token);


--
-- Name: sessions sessions_token_key10; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key10 UNIQUE (token);


--
-- Name: sessions sessions_token_key11; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key11 UNIQUE (token);


--
-- Name: sessions sessions_token_key12; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key12 UNIQUE (token);


--
-- Name: sessions sessions_token_key13; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key13 UNIQUE (token);


--
-- Name: sessions sessions_token_key14; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key14 UNIQUE (token);


--
-- Name: sessions sessions_token_key15; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key15 UNIQUE (token);


--
-- Name: sessions sessions_token_key16; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key16 UNIQUE (token);


--
-- Name: sessions sessions_token_key17; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key17 UNIQUE (token);


--
-- Name: sessions sessions_token_key18; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key18 UNIQUE (token);


--
-- Name: sessions sessions_token_key19; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key19 UNIQUE (token);


--
-- Name: sessions sessions_token_key2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key2 UNIQUE (token);


--
-- Name: sessions sessions_token_key20; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key20 UNIQUE (token);


--
-- Name: sessions sessions_token_key21; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key21 UNIQUE (token);


--
-- Name: sessions sessions_token_key22; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key22 UNIQUE (token);


--
-- Name: sessions sessions_token_key3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key3 UNIQUE (token);


--
-- Name: sessions sessions_token_key4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key4 UNIQUE (token);


--
-- Name: sessions sessions_token_key5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key5 UNIQUE (token);


--
-- Name: sessions sessions_token_key6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key6 UNIQUE (token);


--
-- Name: sessions sessions_token_key7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key7 UNIQUE (token);


--
-- Name: sessions sessions_token_key8; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key8 UNIQUE (token);


--
-- Name: sessions sessions_token_key9; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key9 UNIQUE (token);


--
-- Name: system_metrics system_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_metrics
    ADD CONSTRAINT system_metrics_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key UNIQUE (key);


--
-- Name: system_settings system_settings_key_key1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key1 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key10; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key10 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key11; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key11 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key12; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key12 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key13; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key13 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key14; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key14 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key15; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key15 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key16; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key16 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key17; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key17 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key18; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key18 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key2 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key3 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key4 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key5 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key6 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key7 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key8; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key8 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key9; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key9 UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- Name: users users_email_key14; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key14 UNIQUE (email);


--
-- Name: users users_email_key15; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key15 UNIQUE (email);


--
-- Name: users users_email_key16; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key16 UNIQUE (email);


--
-- Name: users users_email_key17; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key17 UNIQUE (email);


--
-- Name: users users_email_key18; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key18 UNIQUE (email);


--
-- Name: users users_email_key19; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key19 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key20; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key20 UNIQUE (email);


--
-- Name: users users_email_key21; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key21 UNIQUE (email);


--
-- Name: users users_email_key22; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key22 UNIQUE (email);


--
-- Name: users users_email_key23; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key23 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_versions post_versions_editedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.post_versions
    ADD CONSTRAINT "post_versions_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: post_versions post_versions_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.post_versions
    ADD CONSTRAINT "post_versions_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sessions sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict tuTAYwj5X7l0f9XoAGvJfQbBd0jQiUtV15koxaOffn3SLhLrFYwcMvayiDIV1cQ

