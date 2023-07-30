import { router, setupProgress } from "@inertiajs/core";
import isEqual from "lodash.isequal";
import { themeChange } from "theme-change";
import createServer from "@inertiajs/core/server";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store2, ...callbacks) {
  if (store2 == null) {
    return noop;
  }
  const unsub = store2.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function compute_rest_props(props, keys) {
  const rest = {};
  keys = new Set(keys);
  for (const k in props)
    if (!keys.has(k) && k[0] !== "$")
      rest[k] = props[k];
  return rest;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
const _boolean_attributes = [
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
const boolean_attributes = /* @__PURE__ */ new Set([..._boolean_attributes]);
const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
function is_void(name) {
  return void_element_names.test(name) || name.toLowerCase() === "!doctype";
}
const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function spread(args, attrs_to_add) {
  const attributes = Object.assign({}, ...args);
  if (attrs_to_add) {
    const classes_to_add = attrs_to_add.classes;
    const styles_to_add = attrs_to_add.styles;
    if (classes_to_add) {
      if (attributes.class == null) {
        attributes.class = classes_to_add;
      } else {
        attributes.class += " " + classes_to_add;
      }
    }
    if (styles_to_add) {
      if (attributes.style == null) {
        attributes.style = style_object_to_string(styles_to_add);
      } else {
        attributes.style = style_object_to_string(merge_ssr_styles(attributes.style, styles_to_add));
      }
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name) => {
    if (invalid_attribute_name_character.test(name))
      return;
    const value = attributes[name];
    if (value === true)
      str += " " + name;
    else if (boolean_attributes.has(name.toLowerCase())) {
      if (value)
        str += " " + name;
    } else if (value != null) {
      str += ` ${name}="${value}"`;
    }
  });
  return str;
}
function merge_ssr_styles(style_attribute, style_directive) {
  const style_object = {};
  for (const individual_style of style_attribute.split(";")) {
    const colon_index = individual_style.indexOf(":");
    const name = individual_style.slice(0, colon_index).trim();
    const value = individual_style.slice(colon_index + 1).trim();
    if (!name)
      continue;
    style_object[name] = value;
  }
  for (const name in style_directive) {
    const value = style_directive[name];
    if (value) {
      style_object[name] = value;
    } else {
      delete style_object[name];
    }
  }
  return style_object;
}
const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;
function escape(value, is_attr = false) {
  const str = String(value);
  const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
  pattern.lastIndex = 0;
  let escaped = "";
  let last = 0;
  while (pattern.test(str)) {
    const i = pattern.lastIndex - 1;
    const ch = str[i];
    escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
    last = i + 1;
  }
  return escaped + str.substring(last);
}
function escape_attribute_value(value) {
  const should_escape = typeof value === "string" || value && typeof value === "object";
  return should_escape ? escape(value, true) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      // these will be immediately discarded
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = /* @__PURE__ */ new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: /* @__PURE__ */ new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css) => css.code).join("\n"),
          map: null
          // TODO
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  const assignment = boolean && value === true ? "" : `="${escape(value, true)}"`;
  return ` ${name}${assignment}`;
}
function style_object_to_string(style_object) {
  return Object.keys(style_object).filter((key) => style_object[key]).map((key) => `${key}: ${escape_attribute_value(style_object[key])};`).join(" ");
}
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set) => {
    let started = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map((store2, i) => subscribe(store2, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (started) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    started = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
      started = false;
    };
  });
}
const store = writable({
  component: null,
  layout: [],
  page: {},
  key: null
});
const h = (component, props, children) => {
  return {
    component,
    ...props ? { props } : {},
    ...children ? { children } : {}
  };
};
const Render = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $store, $$unsubscribe_store;
  $$unsubscribe_store = subscribe(store, (value) => $store = value);
  let { component } = $$props;
  let { props = {} } = $$props;
  let { children = [] } = $$props;
  if ($$props.component === void 0 && $$bindings.component && component !== void 0)
    $$bindings.component(component);
  if ($$props.props === void 0 && $$bindings.props && props !== void 0)
    $$bindings.props(props);
  if ($$props.children === void 0 && $$bindings.children && children !== void 0)
    $$bindings.children(children);
  $$unsubscribe_store();
  return `${$store.component ? `${validate_component(component || missing_component, "svelte:component").$$render($$result, Object.assign({}, props), {}, {
    default: () => {
      return `${each(children, (child, index) => {
        return `${validate_component(Render, "svelte:self").$$render($$result, Object.assign({}, child), {}, {})}`;
      })}`;
    }
  })}` : ``}`;
});
const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let child;
  let layout;
  let components;
  let $store, $$unsubscribe_store;
  $$unsubscribe_store = subscribe(store, (value) => $store = value);
  child = $store.component && h($store.component.default, $store.page.props);
  layout = $store.component && $store.component.layout;
  components = layout ? Array.isArray(layout) ? layout.concat(child).reverse().reduce((child2, layout2) => h(layout2, $store.page.props, [child2])) : h(layout, $store.page.props, [child]) : child;
  $$unsubscribe_store();
  return `${validate_component(Render, "Render").$$render($$result, Object.assign({}, components), {}, {})}`;
});
const SSR = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { id, initialPage } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0)
    $$bindings.id(id);
  if ($$props.initialPage === void 0 && $$bindings.initialPage && initialPage !== void 0)
    $$bindings.initialPage(initialPage);
  return `<div data-server-rendered="true"${add_attribute("id", id, 0)}${add_attribute("data-page", JSON.stringify(initialPage), 0)}>${validate_component(App, "App").$$render($$result, {}, {}, {})}</div>`;
});
async function createInertiaApp({ id = "app", resolve, setup, progress = {}, page: page2 }) {
  const isServer = typeof window === "undefined";
  const el = isServer ? null : document.getElementById(id);
  const initialPage = page2 || JSON.parse(el.dataset.page);
  const resolveComponent = (name) => Promise.resolve(resolve(name));
  await resolveComponent(initialPage.component).then((initialComponent) => {
    store.set({
      component: initialComponent,
      page: initialPage
    });
  });
  if (!isServer) {
    router.init({
      initialPage,
      resolveComponent,
      swapComponent: async ({ component, page: page3, preserveState }) => {
        store.update((current) => ({
          component,
          page: page3,
          key: preserveState ? current.key : Date.now()
        }));
      }
    });
    if (progress) {
      setupProgress(progress);
    }
    return setup({
      el,
      App,
      props: {
        initialPage,
        resolveComponent
      }
    });
  }
  if (isServer) {
    const { html, head } = SSR.render({ id, initialPage });
    return {
      body: html,
      head: [head]
    };
  }
}
const Link$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, [
    "href",
    "as",
    "data",
    "method",
    "replace",
    "preserveScroll",
    "preserveState",
    "only",
    "headers",
    "queryStringArrayFormat"
  ]);
  let { href } = $$props;
  let { as = "a" } = $$props;
  let { data = {} } = $$props;
  let { method = "get" } = $$props;
  let { replace = false } = $$props;
  let { preserveScroll = false } = $$props;
  let { preserveState = null } = $$props;
  let { only = [] } = $$props;
  let { headers = {} } = $$props;
  let { queryStringArrayFormat = "brackets" } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.as === void 0 && $$bindings.as && as !== void 0)
    $$bindings.as(as);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  if ($$props.method === void 0 && $$bindings.method && method !== void 0)
    $$bindings.method(method);
  if ($$props.replace === void 0 && $$bindings.replace && replace !== void 0)
    $$bindings.replace(replace);
  if ($$props.preserveScroll === void 0 && $$bindings.preserveScroll && preserveScroll !== void 0)
    $$bindings.preserveScroll(preserveScroll);
  if ($$props.preserveState === void 0 && $$bindings.preserveState && preserveState !== void 0)
    $$bindings.preserveState(preserveState);
  if ($$props.only === void 0 && $$bindings.only && only !== void 0)
    $$bindings.only(only);
  if ($$props.headers === void 0 && $$bindings.headers && headers !== void 0)
    $$bindings.headers(headers);
  if ($$props.queryStringArrayFormat === void 0 && $$bindings.queryStringArrayFormat && queryStringArrayFormat !== void 0)
    $$bindings.queryStringArrayFormat(queryStringArrayFormat);
  return `${((tag) => {
    return tag ? `<${as}${spread([escape_object(as === "a" ? { href } : {}), escape_object($$restProps)], {})}>${is_void(tag) ? "" : `${slots.default ? slots.default({}) : ``}`}${is_void(tag) ? "" : `</${tag}>`}` : "";
  })(as)}`;
});
const page = derived(store, ($store) => $store.page);
function useForm(...args) {
  const rememberKey = typeof args[0] === "string" ? args[0] : null;
  const data = (typeof args[0] === "string" ? args[1] : args[0]) || {};
  const restored = rememberKey ? router.restore(rememberKey) : null;
  let defaults = data;
  let cancelToken = null;
  let recentlySuccessfulTimeoutId = null;
  let transform = (data2) => data2;
  const store2 = writable({
    ...restored ? restored.data : data,
    isDirty: false,
    errors: restored ? restored.errors : {},
    hasErrors: false,
    progress: null,
    wasSuccessful: false,
    recentlySuccessful: false,
    processing: false,
    setStore(key, value) {
      store2.update((store3) => {
        return Object.assign({}, store3, typeof key === "string" ? { [key]: value } : key);
      });
    },
    data() {
      return Object.keys(data).reduce((carry, key) => {
        carry[key] = this[key];
        return carry;
      }, {});
    },
    transform(callback) {
      transform = callback;
      return this;
    },
    defaults(key, value) {
      if (typeof key === "undefined") {
        defaults = Object.assign(defaults, this.data());
        return this;
      }
      defaults = Object.assign(defaults, value ? { [key]: value } : key);
      return this;
    },
    reset(...fields) {
      if (fields.length === 0) {
        this.setStore(defaults);
      } else {
        this.setStore(
          Object.keys(defaults).filter((key) => fields.includes(key)).reduce((carry, key) => {
            carry[key] = defaults[key];
            return carry;
          }, {})
        );
      }
      return this;
    },
    setError(key, value) {
      this.setStore("errors", {
        ...this.errors,
        ...value ? { [key]: value } : key
      });
      return this;
    },
    clearErrors(...fields) {
      this.setStore(
        "errors",
        Object.keys(this.errors).reduce(
          (carry, field) => ({
            ...carry,
            ...fields.length > 0 && !fields.includes(field) ? { [field]: this.errors[field] } : {}
          }),
          {}
        )
      );
      return this;
    },
    submit(method, url, options = {}) {
      const data2 = transform(this.data());
      const _options = {
        ...options,
        onCancelToken: (token) => {
          cancelToken = token;
          if (options.onCancelToken) {
            return options.onCancelToken(token);
          }
        },
        onBefore: (visit) => {
          this.setStore("wasSuccessful", false);
          this.setStore("recentlySuccessful", false);
          clearTimeout(recentlySuccessfulTimeoutId);
          if (options.onBefore) {
            return options.onBefore(visit);
          }
        },
        onStart: (visit) => {
          this.setStore("processing", true);
          if (options.onStart) {
            return options.onStart(visit);
          }
        },
        onProgress: (event) => {
          this.setStore("progress", event);
          if (options.onProgress) {
            return options.onProgress(event);
          }
        },
        onSuccess: async (page2) => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          this.clearErrors();
          this.setStore("wasSuccessful", true);
          this.setStore("recentlySuccessful", true);
          recentlySuccessfulTimeoutId = setTimeout(() => this.setStore("recentlySuccessful", false), 2e3);
          if (options.onSuccess) {
            return options.onSuccess(page2);
          }
        },
        onError: (errors) => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          this.clearErrors().setError(errors);
          if (options.onError) {
            return options.onError(errors);
          }
        },
        onCancel: () => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          if (options.onCancel) {
            return options.onCancel();
          }
        },
        onFinish: () => {
          this.setStore("processing", false);
          this.setStore("progress", null);
          cancelToken = null;
          if (options.onFinish) {
            return options.onFinish();
          }
        }
      };
      if (method === "delete") {
        router.delete(url, { ..._options, data: data2 });
      } else {
        router[method](url, data2, _options);
      }
    },
    get(url, options) {
      this.submit("get", url, options);
    },
    post(url, options) {
      this.submit("post", url, options);
    },
    put(url, options) {
      this.submit("put", url, options);
    },
    patch(url, options) {
      this.submit("patch", url, options);
    },
    delete(url, options) {
      this.submit("delete", url, options);
    },
    cancel() {
      if (cancelToken) {
        cancelToken.cancel();
      }
    }
  });
  store2.subscribe((form) => {
    if (form.isDirty === isEqual(form.data(), defaults)) {
      form.setStore("isDirty", !form.isDirty);
    }
    const hasErrors = Object.keys(form.errors).length > 0;
    if (form.hasErrors !== hasErrors) {
      form.setStore("hasErrors", !form.hasErrors);
    }
    if (rememberKey) {
      router.remember({ data: form.data(), errors: form.errors }, rememberKey);
    }
  });
  return store2;
}
const InputLabel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value = null, classes } = $$props;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  return `<label${spread(
    [
      {
        class: "block font-medium text-sm text-gray-700 " + escape(classes, true)
      },
      escape_object($$props)
    ],
    {}
  )}>${value ? `<span>${escape(value)}</span>` : `<span>${slots.default ? slots.default({}) : ``}</span>`}</label>`;
});
const TextInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["value", "classes"]);
  let { value = "", classes = "" } = $$props;
  let inputElement;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  return `<input${spread(
    [
      {
        class: "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full " + escape(classes, true)
      },
      escape_object($$restProps)
    ],
    {}
  )}${add_attribute("value", value, 0)}${add_attribute("this", inputElement, 0)}>`;
});
const InputError = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { message = null } = $$props;
  if ($$props.message === void 0 && $$bindings.message && message !== void 0)
    $$bindings.message(message);
  return `${message ? `<p class="text-sm text-red-600 mt-2">${escape(message)}</p>` : ``}`;
});
const PrimaryButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "submit", disabled = false, classes = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  return `<button ${disabled ? "disabled" : ""}${add_attribute("type", type, 0)} class="${"inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 " + escape(classes, true) + " " + escape(disabled ? "opacity-25" : "", true)}">${slots.default ? slots.default({}) : ``}</button>`;
});
const ConfirmPassword = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  const form = useForm({ password: "" });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-ft9boq_START -->${$$result.title = `<title>Confirm Password</title>`, ""}<!-- HEAD_svelte-ft9boq_END -->`, ""}

<div class="mb-4 text-sm text-gray-600">This is a secure area of the application. Please confirm your password
    before continuing.
</div>

<form><div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "password", value: "Password" }, {}, {})}
        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password",
        type: "password",
        classes: "mt-1 block w-full",
        required: true,
        autocomplete: "current-password",
        autofocus: true,
        value: $form.password
      },
      {
        value: ($$value) => {
          $form.password = $$value;
          $$settled = false;
        }
      },
      {}
    )}
        ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        classes: "mt-2",
        message: $form.errors.password
      },
      {},
      {}
    )}</div>

    <div class="flex justify-end mt-4">${validate_component(PrimaryButton, "PrimaryButton").$$render($$result, { disabled: $form.processing }, {}, {
      default: () => {
        return `Confirm`;
      }
    })}</div></form>`;
  } while (!$$settled);
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ConfirmPassword
}, Symbol.toStringTag, { value: "Module" }));
const theme = writable("");
const ApplicationLogo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentTheme = document.documentElement.getAttribute("data-theme");
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
        currentTheme = document.documentElement.getAttribute("data-theme");
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });
  {
    {
      currentTheme = document.documentElement.getAttribute("data-theme");
    }
  }
  {
    {
      theme.set(currentTheme);
    }
  }
  return `${validate_component(Link$1, "Link").$$render(
    $$result,
    {
      class: "text-2xl normal-case btn btn-ghost",
      href: "/"
    },
    {},
    {
      default: () => {
        return `${currentTheme == "cmyk" ? `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 590.000000 675.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,675.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M2777 6729 c-128 -14 -260 -69 -355 -147 -102 -83 -137 -240 -92
    -407 28 -105 112 -306 201 -480 39 -77 85 -166 101 -198 16 -32 53 -96 83
    -141 91 -138 77 -132 -105 45 -192 186 -445 395 -604 497 -93 60 -208 113
    -275 128 -171 36 -334 -58 -429 -248 -64 -126 -75 -187 -69 -353 4 -134 6
    -144 41 -224 57 -132 113 -207 213 -288 90 -72 238 -154 315 -174 98 -25 167
    -38 241 -44 l78 -7 -43 -36 c-23 -21 -52 -46 -63 -57 -49 -50 -213 -135 -335
    -174 -71 -22 -170 -36 -325 -46 -55 -4 -125 -13 -155 -22 -80 -22 -175 -78
    -227 -133 -44 -47 -55 -53 -293 -162 -67 -31 -151 -87 -255 -171 -33 -26 -80
    -60 -105 -74 -25 -14 -54 -34 -65 -44 -11 -10 -63 -43 -115 -74 -154 -92 -137
    -35 -139 -475 l-2 -379 23 -5 c13 -3 84 -17 158 -32 144 -28 148 -29 310 -68
    162 -39 238 -62 444 -131 311 -105 408 -116 600 -70 159 39 233 67 421 162 80
    41 284 173 304 197 12 15 1 16 -121 16 -152 0 -262 23 -413 85 -127 53 -240
    125 -196 125 5 0 38 -15 73 -34 34 -19 117 -52 183 -74 132 -45 293 -68 400
    -59 33 3 123 10 200 16 162 11 202 19 314 62 68 26 86 38 107 69 45 67 34 73
    -171 93 -399 41 -641 94 -955 211 -36 13 -87 32 -115 41 -27 10 -65 25 -84 33
    -89 42 -311 322 -311 392 0 41 43 124 78 148 36 26 125 56 227 76 232 47 357
    88 461 150 195 117 284 234 301 396 l6 58 41 5 c86 12 350 99 486 159 55 25
    120 42 120 32 0 -17 -34 -64 -62 -86 -18 -14 -53 -46 -78 -70 -25 -24 -128
    -107 -230 -183 -102 -76 -384 -289 -628 -472 l-442 -334 43 -52 c23 -29 58
    -72 77 -97 44 -59 160 -148 230 -176 30 -12 89 -29 130 -37 41 -9 116 -28 165
    -42 102 -29 151 -40 281 -62 l92 -15 188 139 c104 77 297 220 429 318 132 98
    286 212 343 253 56 42 102 80 102 84 0 12 -113 200 -155 259 -18 26 -41 62
    -50 80 -10 19 -55 90 -100 159 -142 215 -237 382 -223 391 22 14 68 -31 138
    -139 38 -59 74 -112 79 -118 5 -6 35 -51 66 -100 244 -379 317 -484 329 -477
    6 4 121 88 256 187 858 630 1100 810 1100 818 0 5 -9 22 -20 36 -31 39 -160
    232 -233 347 -83 130 -175 262 -260 369 l-67 86 -548 -411 c-532 -400 -550
    -412 -647 -449 -55 -21 -102 -37 -103 -35 -4 3 34 60 129 190 118 163 216 323
    292 475 76 154 87 180 123 300 25 83 29 111 29 225 0 104 -4 140 -19 180 -20
    53 -57 109 -91 137 -40 35 -193 107 -266 127 -137 37 -348 50 -512 30z m213
    -126 c106 -75 166 -245 176 -505 8 -181 -8 -301 -82 -618 -34 -145 -105 -380
    -115 -380 -27 0 -117 274 -154 470 -14 74 -31 160 -38 190 -8 35 -12 140 -12
    290 l0 235 33 110 c33 109 61 159 111 202 31 27 49 29 81 6z m-1284 -1104 c66
    -12 212 -65 289 -104 28 -15 113 -59 190 -100 77 -40 174 -91 215 -112 41 -22
    84 -44 95 -51 11 -6 76 -39 145 -73 69 -33 127 -63 129 -65 14 -13 -37 -26
    -189 -50 -144 -22 -366 -22 -515 0 -201 29 -443 106 -559 176 -94 58 -151 161
    -144 259 2 36 9 49 38 72 64 52 184 70 306 48z"></path><path d="M2820 1460 l0 -1450 1535 0 1535 0 0 1450 0 1450 -1535 0 -1535 0 0
    -1450z"></path></g></svg>` : `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 590.000000 675.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,675.000000) scale(0.100000,-0.100000)" fill="#c8cad0" stroke="none"><path d="M2777 6729 c-128 -14 -260 -69 -355 -147 -102 -83 -137 -240 -92
        -407 28 -105 112 -306 201 -480 39 -77 85 -166 101 -198 16 -32 53 -96 83
        -141 91 -138 77 -132 -105 45 -192 186 -445 395 -604 497 -93 60 -208 113
        -275 128 -171 36 -334 -58 -429 -248 -64 -126 -75 -187 -69 -353 4 -134 6
        -144 41 -224 57 -132 113 -207 213 -288 90 -72 238 -154 315 -174 98 -25 167
        -38 241 -44 l78 -7 -43 -36 c-23 -21 -52 -46 -63 -57 -49 -50 -213 -135 -335
        -174 -71 -22 -170 -36 -325 -46 -55 -4 -125 -13 -155 -22 -80 -22 -175 -78
        -227 -133 -44 -47 -55 -53 -293 -162 -67 -31 -151 -87 -255 -171 -33 -26 -80
        -60 -105 -74 -25 -14 -54 -34 -65 -44 -11 -10 -63 -43 -115 -74 -154 -92 -137
        -35 -139 -475 l-2 -379 23 -5 c13 -3 84 -17 158 -32 144 -28 148 -29 310 -68
        162 -39 238 -62 444 -131 311 -105 408 -116 600 -70 159 39 233 67 421 162 80
        41 284 173 304 197 12 15 1 16 -121 16 -152 0 -262 23 -413 85 -127 53 -240
        125 -196 125 5 0 38 -15 73 -34 34 -19 117 -52 183 -74 132 -45 293 -68 400
        -59 33 3 123 10 200 16 162 11 202 19 314 62 68 26 86 38 107 69 45 67 34 73
        -171 93 -399 41 -641 94 -955 211 -36 13 -87 32 -115 41 -27 10 -65 25 -84 33
        -89 42 -311 322 -311 392 0 41 43 124 78 148 36 26 125 56 227 76 232 47 357
        88 461 150 195 117 284 234 301 396 l6 58 41 5 c86 12 350 99 486 159 55 25
        120 42 120 32 0 -17 -34 -64 -62 -86 -18 -14 -53 -46 -78 -70 -25 -24 -128
        -107 -230 -183 -102 -76 -384 -289 -628 -472 l-442 -334 43 -52 c23 -29 58
        -72 77 -97 44 -59 160 -148 230 -176 30 -12 89 -29 130 -37 41 -9 116 -28 165
        -42 102 -29 151 -40 281 -62 l92 -15 188 139 c104 77 297 220 429 318 132 98
        286 212 343 253 56 42 102 80 102 84 0 12 -113 200 -155 259 -18 26 -41 62
        -50 80 -10 19 -55 90 -100 159 -142 215 -237 382 -223 391 22 14 68 -31 138
        -139 38 -59 74 -112 79 -118 5 -6 35 -51 66 -100 244 -379 317 -484 329 -477
        6 4 121 88 256 187 858 630 1100 810 1100 818 0 5 -9 22 -20 36 -31 39 -160
        232 -233 347 -83 130 -175 262 -260 369 l-67 86 -548 -411 c-532 -400 -550
        -412 -647 -449 -55 -21 -102 -37 -103 -35 -4 3 34 60 129 190 118 163 216 323
        292 475 76 154 87 180 123 300 25 83 29 111 29 225 0 104 -4 140 -19 180 -20
        53 -57 109 -91 137 -40 35 -193 107 -266 127 -137 37 -348 50 -512 30z m213
        -126 c106 -75 166 -245 176 -505 8 -181 -8 -301 -82 -618 -34 -145 -105 -380
        -115 -380 -27 0 -117 274 -154 470 -14 74 -31 160 -38 190 -8 35 -12 140 -12
        290 l0 235 33 110 c33 109 61 159 111 202 31 27 49 29 81 6z m-1284 -1104 c66
        -12 212 -65 289 -104 28 -15 113 -59 190 -100 77 -40 174 -91 215 -112 41 -22
        84 -44 95 -51 11 -6 76 -39 145 -73 69 -33 127 -63 129 -65 14 -13 -37 -26
        -189 -50 -144 -22 -366 -22 -515 0 -201 29 -443 106 -559 176 -94 58 -151 161
        -144 259 2 36 9 49 38 72 64 52 184 70 306 48z"></path><path d="M2820 1460 l0 -1450 1535 0 1535 0 0 1450 0 1450 -1535 0 -1535 0 0
        -1450z"></path></g></svg>`}
    Gaaftly
`;
      }
    }
  )}`;
});
const ChangeTheme = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $theme, $$unsubscribe_theme;
  $$unsubscribe_theme = subscribe(theme, (value) => $theme = value);
  themeChange();
  $$unsubscribe_theme();
  return `<button data-toggle-theme="night,cmyk" data-act-class="ACTIVECLASS">${$theme === "cmyk" ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#c8cad0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`}</button>`;
});
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { canLogin, canRegister, user } = $$props;
  if ($$props.canLogin === void 0 && $$bindings.canLogin && canLogin !== void 0)
    $$bindings.canLogin(canLogin);
  if ($$props.canRegister === void 0 && $$bindings.canRegister && canRegister !== void 0)
    $$bindings.canRegister(canRegister);
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  $$unsubscribe_page();
  return `<div class="navbar bg-base-100"><div class="navbar-start"><div class="dropdown"><label tabindex="0" class="btn btn-ghost rounded"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg></label>
            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"><li><a>Homepage</a></li>
                <li><a>Portfolio</a></li>
                <li><a>About</a></li></ul></div>
        ${validate_component(ChangeTheme, "ChangeTheme").$$render($$result, {}, {}, {})}</div>
    <div class="navbar-center">${validate_component(ApplicationLogo, "ApplicationLogo").$$render($$result, {}, {}, {})}</div>
    <div class="navbar-end">${canLogin ? `<div class="p-6 text-right">${$page.props.auth.user ? `${validate_component(Link$1, "Link").$$render(
    $$result,
    {
      href: route("dashboard"),
      class: "font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
    },
    {},
    {
      default: () => {
        return `Dashboard`;
      }
    }
  )}` : `${canLogin ? `${validate_component(Link$1, "Link").$$render($$result, { href: route("login"), class: "" }, {}, {
    default: () => {
      return `<button class="hover:text-white">Login</button>`;
    }
  })}` : ``}

                    ${canRegister ? `${validate_component(Link$1, "Link").$$render($$result, { href: route("register"), class: "" }, {}, {
    default: () => {
      return `<button class="hover:text-white">Register</button>`;
    }
  })}` : ``}`}</div>` : ``}</div></div>`;
});
const GuestLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { canLogin, canRegister } = $$props;
  if ($$props.canLogin === void 0 && $$bindings.canLogin && canLogin !== void 0)
    $$bindings.canLogin(canLogin);
  if ($$props.canRegister === void 0 && $$bindings.canRegister && canRegister !== void 0)
    $$bindings.canRegister(canRegister);
  $$unsubscribe_page();
  return `<div class="min-h-screen flex flex-col">${validate_component(Navbar, "Navbar").$$render(
    $$result,
    {
      canLogin,
      canRegister,
      user: $page.props.auth.user
    },
    {},
    {}
  )}
    ${slots.default ? slots.default({}) : ``}</div>`;
});
const ForgotPassword = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  let { status } = $$props;
  const form = useForm({ email: "" });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-fslpkp_START -->${$$result.title = `<title>Forgot Password</title>`, ""}<!-- HEAD_svelte-fslpkp_END -->`, ""}

<div class="mb-4 text-sm text-gray-600">Forgot your password? No problem. Just let us know your email address and we
    will email you a password reset link that will allow you to choose a new
    one.
</div>

${status ? `<div class="mb-4 font-medium text-sm text-green-600">${escape(status)}</div>` : ``}

<form><div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "email", value: "Email" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "email",
        type: "email",
        classes: "mt-1 block w-full",
        required: true,
        autofocus: true,
        autocomplete: "username",
        value: $form.email
      },
      {
        value: ($$value) => {
          $form.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        class: "mt-2",
        message: $form.errors.email
      },
      {},
      {}
    )}</div>

    <div class="flex items-center justify-end mt-4">${validate_component(PrimaryButton, "PrimaryButton").$$render($$result, { disabled: $form.processing }, {}, {
      default: () => {
        return `Email Password Reset Link
        `;
      }
    })}</div></form>`;
  } while (!$$settled);
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ForgotPassword,
  layout: GuestLayout
}, Symbol.toStringTag, { value: "Module" }));
const Checkbox = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { checked = false } = $$props;
  if ($$props.checked === void 0 && $$bindings.checked && checked !== void 0)
    $$bindings.checked(checked);
  return `<input${spread(
    [
      { type: "checkbox" },
      escape_object($$props),
      {
        class: "rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
      }
    ],
    {}
  )}${add_attribute("checked", checked, 1)}>`;
});
const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  let { canResetPassword, status } = $$props;
  const form = useForm({ email: "", password: "", remember: false });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  if ($$props.canResetPassword === void 0 && $$bindings.canResetPassword && canResetPassword !== void 0)
    $$bindings.canResetPassword(canResetPassword);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1ox86gm_START -->${$$result.title = `<title>Log in</title>`, ""}<!-- HEAD_svelte-1ox86gm_END -->`, ""}

${status ? `<div class="mb-4 font-medium text-sm text-green-600">${escape(status)}</div>` : ``}

<form><div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "email", value: "Email" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "email",
        type: "email",
        required: true,
        autofocus: true,
        autocomplete: "username",
        value: $form.email
      },
      {
        value: ($$value) => {
          $form.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.email }, {}, {})}</div>

    <div class="mt-4">${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "password", value: "Password" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password",
        type: "password",
        required: true,
        autocomplete: "current-password",
        value: $form.password
      },
      {
        value: ($$value) => {
          $form.password = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.password }, {}, {})}</div>

    <div class="block mt-4"><label class="flex items-center">${validate_component(Checkbox, "Checkbox").$$render(
      $$result,
      {
        name: "remember",
        checked: $form.remember
      },
      {
        checked: ($$value) => {
          $form.remember = $$value;
          $$settled = false;
        }
      },
      {}
    )}
            <span class="ml-2 text-sm text-gray-600">Remember me</span></label></div>

    <div class="flex items-center justify-end mt-4">${canResetPassword ? `${validate_component(Link$1, "Link").$$render(
      $$result,
      {
        href: route("password.request"),
        class: "underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      },
      {},
      {
        default: () => {
          return `Forgot your password?
            `;
        }
      }
    )}` : ``}

        ${validate_component(PrimaryButton, "PrimaryButton").$$render(
      $$result,
      {
        disabled: $form.processing,
        classes: "ml-4"
      },
      {},
      {
        default: () => {
          return `Log in
        `;
        }
      }
    )}</div></form>`;
  } while (!$$settled);
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login,
  layout: GuestLayout
}, Symbol.toStringTag, { value: "Module" }));
const Register = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  const form = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    terms: false
  });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-x3krtu_START -->${$$result.title = `<title>Register</title>`, ""}<!-- HEAD_svelte-x3krtu_END -->`, ""}

<form><div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "name", value: "Name" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "name",
        type: "text",
        required: true,
        autofocus: true,
        autocomplete: "name",
        value: $form.name
      },
      {
        value: ($$value) => {
          $form.name = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        class: "mt-2",
        message: $form.errors.name
      },
      {},
      {}
    )}</div>

    <div class="mt-4">${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "email", value: "Email" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "email",
        type: "email",
        required: true,
        autocomplete: "email",
        value: $form.email
      },
      {
        value: ($$value) => {
          $form.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        class: "mt-2",
        message: $form.errors.email
      },
      {},
      {}
    )}</div>

    <div class="mt-4">${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "password", value: "Password" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password",
        type: "password",
        required: true,
        autocomplete: "new-password",
        value: $form.password
      },
      {
        value: ($$value) => {
          $form.password = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        class: "mt-2",
        message: $form.errors.password
      },
      {},
      {}
    )}</div>

    <div class="mt-4">${validate_component(InputLabel, "InputLabel").$$render(
      $$result,
      {
        for: "password_confirmation",
        value: "Confirm Password"
      },
      {},
      {}
    )}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password_confirmation",
        type: "password",
        required: true,
        autocomplete: "new-password",
        value: $form.password_confirmation
      },
      {
        value: ($$value) => {
          $form.password_confirmation = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        class: "mt-2",
        message: $form.errors.password_confirmation
      },
      {},
      {}
    )}</div>

    <div class="flex items-center justify-end mt-4">${validate_component(Link$1, "Link").$$render(
      $$result,
      {
        href: route("login"),
        class: "underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      },
      {},
      {
        default: () => {
          return `Already registered?
        `;
        }
      }
    )}

        ${validate_component(PrimaryButton, "PrimaryButton").$$render(
      $$result,
      {
        disabled: $form.processing,
        classes: "ml-4"
      },
      {},
      {
        default: () => {
          return `Register
        `;
        }
      }
    )}</div></form>`;
  } while (!$$settled);
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Register,
  layout: GuestLayout
}, Symbol.toStringTag, { value: "Module" }));
const ResetPassword = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  let { email, token } = $$props;
  const form = useForm({
    token,
    email,
    password: "",
    password_confirmation: ""
  });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  if ($$props.email === void 0 && $$bindings.email && email !== void 0)
    $$bindings.email(email);
  if ($$props.token === void 0 && $$bindings.token && token !== void 0)
    $$bindings.token(token);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-yw86u1_START -->${$$result.title = `<title>Reset Password</title>`, ""}<!-- HEAD_svelte-yw86u1_END -->`, ""}

<form><div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "email", value: "Email" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "email",
        type: "email",
        required: true,
        autofocus: true,
        autocomplete: "username",
        value: $form.email
      },
      {
        value: ($$value) => {
          $form.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.email }, {}, {})}</div>

    <div class="mt-4">${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "password", value: "Password" }, {}, {})}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password",
        type: "password",
        required: true,
        autocomplete: "new-password",
        value: $form.password
      },
      {
        value: ($$value) => {
          $form.password = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.password }, {}, {})}</div>

    <div class="mt-4">${validate_component(InputLabel, "InputLabel").$$render(
      $$result,
      {
        for: "password_confirmation",
        value: "Confirm Password"
      },
      {},
      {}
    )}

        ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password_confirmation",
        type: "password",
        required: true,
        autocomplete: "new-password",
        value: $form.password_confirmation
      },
      {
        value: ($$value) => {
          $form.password_confirmation = $$value;
          $$settled = false;
        }
      },
      {}
    )}

        ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        message: $form.errors.password_confirmation
      },
      {},
      {}
    )}</div>

    <div class="flex items-center justify-end mt-4">${validate_component(PrimaryButton, "PrimaryButton").$$render($$result, { disabled: $form.processing }, {}, {
      default: () => {
        return `Reset Password
        `;
      }
    })}</div></form>`;
  } while (!$$settled);
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ResetPassword,
  layout: GuestLayout
}, Symbol.toStringTag, { value: "Module" }));
const VerifyEmail = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  let { status } = $$props;
  const form = useForm({});
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  const verificationLinkSent = status === "verification-link-sent";
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  $$unsubscribe_form();
  return `${$$result.head += `<!-- HEAD_svelte-qz6qks_START -->${$$result.title = `<title>Email Verification</title>`, ""}<!-- HEAD_svelte-qz6qks_END -->`, ""}

<div class="mb-4 text-sm text-gray-600">Thanks for signing up! Before getting started, could you verify your email
    address by clicking on the link we just emailed to you? If you didn&#39;t
    receive the email, we will gladly send you another.
</div>

${verificationLinkSent ? `<div class="mb-4 font-medium text-sm text-green-600">A new verification link has been sent to the email address you provided
        during registration.
    </div>` : ``}

<form><div class="mt-4 flex items-center justify-between">${validate_component(PrimaryButton, "PrimaryButton").$$render(
    $$result,
    {
      class: $form.processing ? "opacity-25" : "",
      ":disabled": "form.processing"
    },
    {},
    {
      default: () => {
        return `Resend Verification Email
        `;
      }
    }
  )}

        ${validate_component(Link$1, "Link").$$render(
    $$result,
    {
      href: route("logout"),
      method: "post",
      as: "button",
      class: "underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    },
    {},
    {
      default: () => {
        return `Log Out`;
      }
    }
  )}</div></form>`;
});
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: VerifyEmail
}, Symbol.toStringTag, { value: "Module" }));
const NavLink = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { href = null, active = false } = $$props;
  const classes = active ? "inline-flex items-center px-1 pt-1 border-b-2 border-indigo-400 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-indigo-700 transition duration-150 ease-in-out" : "inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out";
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  return `${validate_component(Link$1, "Link").$$render($$result, { href, class: classes }, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const Dropdown = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { align = "right", width = "48", contentClasses = "py-1 bg-white" } = $$props;
  ({ 48: "w-48" })[width.toString()];
  if ($$props.align === void 0 && $$bindings.align && align !== void 0)
    $$bindings.align(align);
  if ($$props.width === void 0 && $$bindings.width && width !== void 0)
    $$bindings.width(width);
  if ($$props.contentClasses === void 0 && $$bindings.contentClasses && contentClasses !== void 0)
    $$bindings.contentClasses(contentClasses);
  return `<div class="relative"><div>${slots.trigger ? slots.trigger({}) : ``}</div>

    
    ${``}

    ${``}</div>`;
});
const DropdownLink = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { href, method = "get", as = "button" } = $$props;
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.method === void 0 && $$bindings.method && method !== void 0)
    $$bindings.method(method);
  if ($$props.as === void 0 && $$bindings.as && as !== void 0)
    $$bindings.as(as);
  return `${validate_component(Link$1, "Link").$$render(
    $$result,
    {
      as,
      method,
      href,
      class: "block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
    },
    {},
    {
      default: () => {
        return `${slots.default ? slots.default({}) : ``}`;
      }
    }
  )}`;
});
const ResponsiveNavLink = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { href = null, active = false } = $$props;
  const classes = active ? "block w-full pl-3 pr-4 py-2 border-l-4 border-indigo-400 text-left text-base font-medium text-indigo-700 bg-indigo-50 focus:outline-none focus:text-indigo-800 focus:bg-indigo-100 focus:border-indigo-700 transition duration-150 ease-in-out" : "block w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-left text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out";
  if ($$props.href === void 0 && $$bindings.href && href !== void 0)
    $$bindings.href(href);
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  return `${validate_component(Link$1, "Link").$$render($$result, { href, class: classes }, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
const AuthenticatedLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `<div><div class="min-h-screen bg-gray-100"><nav class="bg-white border-b border-gray-100">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between h-16"><div class="flex">
                        <div class="shrink-0 flex items-center">${validate_component(Link$1, "Link").$$render($$result, { href: route("dashboard") }, {}, {
    default: () => {
      return `${validate_component(ApplicationLogo, "ApplicationLogo").$$render(
        $$result,
        {
          classes: "block h-9 w-auto fill-current text-gray-800"
        },
        {},
        {}
      )}`;
    }
  })}</div>

                        
                        <div class="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            ${validate_component(NavLink, "NavLink").$$render(
    $$result,
    {
      href: route("dashboard"),
      active: route().current("dashboard")
    },
    {},
    {
      default: () => {
        return `Dashboard
                            `;
      }
    }
  )}</div></div>

                    <div class="hidden sm:flex sm:items-center sm:ml-6">
                        <div class="ml-3 relative">${validate_component(Dropdown, "Dropdown").$$render($$result, { align: "right", width: "48" }, {}, {
    content: () => {
      return `
                                    ${validate_component(DropdownLink, "DropdownLink").$$render($$result, { href: route("profile.edit") }, {}, {
        default: () => {
          return `Profile
                                    `;
        }
      })}
                                    ${validate_component(DropdownLink, "DropdownLink").$$render(
        $$result,
        {
          href: route("logout"),
          method: "post",
          as: "button"
        },
        {},
        {
          default: () => {
            return `Log Out
                                    `;
          }
        }
      )}
                                `;
    },
    trigger: () => {
      return `<span class="inline-flex rounded-md"><button type="button" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">${escape($page.props.auth.user.name)}

                                            <svg class="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></span>`;
    }
  })}</div></div>

                    
                    <div class="-mr-2 flex items-center sm:hidden"><button class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"><svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path${add_attribute("class", "inline-flex", 0)} stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path><path${add_attribute("class", "inline-flex", 0)} stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div></div>

            
            <div class="${escape("hidden", true) + " sm:hidden"}"><div class="pt-2 pb-3 space-y-1">${validate_component(ResponsiveNavLink, "ResponsiveNavLink").$$render(
    $$result,
    {
      href: route("dashboard"),
      active: route().current("dashboard")
    },
    {},
    {
      default: () => {
        return `Dashboard
                    `;
      }
    }
  )}</div>

                
                <div class="pt-4 pb-1 border-t border-gray-200"><div class="px-4"><div class="font-medium text-base text-gray-800">${escape($page.props.auth.user.name)}</div>
                        <div class="font-medium text-sm text-gray-500">${escape($page.props.auth.user.email)}</div></div>

                    <div class="mt-3 space-y-1">${validate_component(ResponsiveNavLink, "ResponsiveNavLink").$$render($$result, { href: route("profile.edit") }, {}, {
    default: () => {
      return `Profile
                        `;
    }
  })}
                        ${validate_component(ResponsiveNavLink, "ResponsiveNavLink").$$render(
    $$result,
    {
      href: route("logout"),
      method: "post",
      as: "button"
    },
    {},
    {
      default: () => {
        return `Log Out
                        `;
      }
    }
  )}</div></div></div></nav>

        
        <main>${slots.default ? slots.default({}) : ``}</main></div></div>`;
});
const Dashboard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-lyzp5d_START -->${$$result.title = `<title>Dashboard</title>`, ""}<!-- HEAD_svelte-lyzp5d_END -->`, ""}

<div class="py-12"><div class="max-w-7xl mx-auto sm:px-6 lg:px-8"><div class="bg-white overflow-hidden shadow-sm sm:rounded-lg"><div class="p-6 text-gray-900">You&#39;re logged in!
            </div></div></div></div>`;
});
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard,
  layout: AuthenticatedLayout
}, Symbol.toStringTag, { value: "Module" }));
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { show = false, maxWidth = "2xl", closeable = true, onClose = () => {
  } } = $$props;
  const maxWidthClass = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl"
  }[maxWidth];
  if ($$props.show === void 0 && $$bindings.show && show !== void 0)
    $$bindings.show(show);
  if ($$props.maxWidth === void 0 && $$bindings.maxWidth && maxWidth !== void 0)
    $$bindings.maxWidth(maxWidth);
  if ($$props.closeable === void 0 && $$bindings.closeable && closeable !== void 0)
    $$bindings.closeable(closeable);
  if ($$props.onClose === void 0 && $$bindings.onClose && onClose !== void 0)
    $$bindings.onClose(onClose);
  return `${show ? `<div class="fixed inset-0 overflow-y-auto px-4 py-6 sm:px-0 z-50" scroll-region>${show ? `<div class="fixed inset-0 transform transition-all"><div class="absolute inset-0 bg-gray-500 opacity-75"></div></div>` : ``}

        ${show ? `<div class="${"mb-6 bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:mx-auto " + escape(maxWidthClass, true)}">${show ? `${slots.default ? slots.default({}) : ``}` : ``}</div>` : ``}</div>` : ``}`;
});
const DangerButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "submit", onClick = () => {
  }, classes = "" } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.onClick === void 0 && $$bindings.onClick && onClick !== void 0)
    $$bindings.onClick(onClick);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  return `<button${add_attribute("type", type, 0)} class="${"inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 " + escape(classes, true)}">${slots.default ? slots.default({}) : ``}</button>`;
});
const SecondaryButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { type = "button", onClick = () => {
  } } = $$props;
  if ($$props.type === void 0 && $$bindings.type && type !== void 0)
    $$bindings.type(type);
  if ($$props.onClick === void 0 && $$bindings.onClick && onClick !== void 0)
    $$bindings.onClick(onClick);
  return `<button${add_attribute("type", type, 0)} class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">${slots.default ? slots.default({}) : ``}</button>`;
});
const DeleteUserForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  let { classes } = $$props;
  let confirmingUserDeletion = false;
  const form = useForm({ password: "" });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  const confirmUserDeletion = () => {
    confirmingUserDeletion = true;
  };
  const deleteUser = () => {
    $form.delete(route("profile.destroy"), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onFinish: () => $form.reset()
    });
  };
  const closeModal = () => {
    confirmingUserDeletion = false;
    $form.clearErrors();
    $form.reset();
  };
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<section class="${"space-y-6 " + escape(classes, true)}"><header><h2 class="text-lg font-medium text-gray-900">Delete Account
        </h2>

        <p class="mt-1 text-sm text-gray-600">Once your account is deleted, all of its resources and data will be
            permanently deleted. Before deleting your account, please download
            any data or information that you wish to retain.
        </p></header>

    ${validate_component(DangerButton, "DangerButton").$$render($$result, { onClick: confirmUserDeletion }, {}, {
      default: () => {
        return `Delete Account`;
      }
    })}

    ${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        show: confirmingUserDeletion,
        onClose: closeModal
      },
      {},
      {
        default: () => {
          return `<div class="p-6"><h2 class="text-lg font-medium text-gray-900">Are you sure you want to delete your account?
            </h2>

            <p class="mt-1 text-sm text-gray-600">Once your account is deleted, all of its resources and data will
                be permanently deleted. Please enter your password to confirm
                you would like to permanently delete your account.
            </p>

            <div class="mt-6">${validate_component(InputLabel, "InputLabel").$$render(
            $$result,
            {
              for: "password",
              value: "Password",
              classes: "sr-only"
            },
            {},
            {}
          )}

                ${validate_component(TextInput, "TextInput").$$render(
            $$result,
            {
              id: "password",
              type: "password",
              classes: "mt-1 block w-3/4",
              placeholder: "Password",
              value: $form.password
            },
            {
              value: ($$value) => {
                $form.password = $$value;
                $$settled = false;
              }
            },
            {}
          )}

                ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.password }, {}, {})}</div>

            <div class="mt-6 flex justify-end">${validate_component(SecondaryButton, "SecondaryButton").$$render($$result, { onClick: closeModal }, {}, {
            default: () => {
              return `Cancel`;
            }
          })}

                ${validate_component(DangerButton, "DangerButton").$$render(
            $$result,
            {
              disabled: $form.processing,
              onClick: deleteUser,
              classes: "ml-3"
            },
            {},
            {
              default: () => {
                return `Delete Account
                `;
              }
            }
          )}</div></div>`;
        }
      }
    )}</section>`;
  } while (!$$settled);
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DeleteUserForm
}, Symbol.toStringTag, { value: "Module" }));
const UpdatePasswordForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $form, $$unsubscribe_form;
  let { classes } = $$props;
  const form = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<section${add_attribute("class", classes, 0)}><header><h2 class="text-lg font-medium text-gray-900">Update Password
        </h2>

        <p class="mt-1 text-sm text-gray-600">Ensure your account is using a long, random password to stay secure.
        </p></header>

    <form class="mt-6 space-y-6"><div>${validate_component(InputLabel, "InputLabel").$$render(
      $$result,
      {
        for: "current_password",
        value: "Current Password"
      },
      {},
      {}
    )}

            ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "current_password",
        type: "password",
        classes: "mt-1 block w-full",
        autocomplete: "current-password",
        value: $form.current_password
      },
      {
        value: ($$value) => {
          $form.current_password = $$value;
          $$settled = false;
        }
      },
      {}
    )}

            ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.current_password }, {}, {})}</div>

        <div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "password", value: "New Password" }, {}, {})}

            ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password",
        type: "password",
        classes: "mt-1 block w-full",
        autocomplete: "new-password",
        value: $form.password
      },
      {
        value: ($$value) => {
          $form.password = $$value;
          $$settled = false;
        }
      },
      {}
    )}

            ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.password }, {}, {})}</div>

        <div>${validate_component(InputLabel, "InputLabel").$$render(
      $$result,
      {
        for: "password_confirmation",
        value: "Confirm Password"
      },
      {},
      {}
    )}

            ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "password_confirmation",
        type: "password",
        classes: "mt-1 block w-full",
        autocomplete: "new-password",
        value: $form.password_confirmation
      },
      {
        value: ($$value) => {
          $form.password_confirmation = $$value;
          $$settled = false;
        }
      },
      {}
    )}

            ${validate_component(InputError, "InputError").$$render(
      $$result,
      {
        message: $form.errors.password_confirmation
      },
      {},
      {}
    )}</div>

        <div class="flex items-center gap-4">${validate_component(PrimaryButton, "PrimaryButton").$$render($$result, { disabled: $form.processing }, {}, {
      default: () => {
        return `Save`;
      }
    })}

            ${$form.recentlySuccessful ? `<p class="text-sm text-gray-600">Saved.</p>` : ``}</div></form></section>`;
  } while (!$$settled);
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UpdatePasswordForm
}, Symbol.toStringTag, { value: "Module" }));
const UpdateProfileInformationForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $form, $$unsubscribe_form;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { mustVerifyEmail = false, status, classes = "" } = $$props;
  const user = $page.props.auth.user;
  const form = useForm({ name: user.name, email: user.email });
  $$unsubscribe_form = subscribe(form, (value) => $form = value);
  if ($$props.mustVerifyEmail === void 0 && $$bindings.mustVerifyEmail && mustVerifyEmail !== void 0)
    $$bindings.mustVerifyEmail(mustVerifyEmail);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<section${add_attribute("class", classes, 0)}><header><h2 class="text-lg font-medium text-gray-900">Profile Information
        </h2>

        <p class="mt-1 text-sm text-gray-600">Update your account&#39;s profile information and email address.
        </p></header>

    <form class="mt-6 space-y-6"><div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "name", value: "Name" }, {}, {})}

            ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "name",
        type: "text",
        classes: "mt-1 block w-full",
        required: true,
        autofocus: true,
        autocomplete: "name",
        value: $form.name
      },
      {
        value: ($$value) => {
          $form.name = $$value;
          $$settled = false;
        }
      },
      {}
    )}

            ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.name }, {}, {})}</div>

        <div>${validate_component(InputLabel, "InputLabel").$$render($$result, { for: "email", value: "Email" }, {}, {})}

            ${validate_component(TextInput, "TextInput").$$render(
      $$result,
      {
        id: "email",
        type: "email",
        classes: "mt-1 block w-full",
        required: true,
        autocomplete: "username",
        value: $form.email
      },
      {
        value: ($$value) => {
          $form.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}

            ${validate_component(InputError, "InputError").$$render($$result, { message: $form.errors.email }, {}, {})}</div>

        ${mustVerifyEmail && user.email_verified_at === null ? `<div><p class="text-sm mt-2 text-gray-800">Your email address is unverified.
                    ${validate_component(Link, "Link").$$render(
      $$result,
      {
        href: route("verification.send"),
        method: "post",
        as: "button",
        class: "underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      },
      {},
      {
        default: () => {
          return `Click here to re-send the verification email.
                    `;
        }
      }
    )}</p>

                ${status === "verification-link-sent" ? `<div class="mt-2 font-medium text-sm text-green-600">A new verification link has been sent to your email
                        address.
                    </div>` : ``}</div>` : ``}

        <div class="flex items-center gap-4">${validate_component(PrimaryButton, "PrimaryButton").$$render($$result, { disabled: $form.processing }, {}, {
      default: () => {
        return `Save`;
      }
    })}

            ${$form.recentlySuccessful ? `<p class="text-sm text-gray-600">Saved.</p>` : ``}</div></form></section>`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_form();
  return $$rendered;
});
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UpdateProfileInformationForm
}, Symbol.toStringTag, { value: "Module" }));
const Edit = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { mustVerifyEmail = false, status = null } = $$props;
  if ($$props.mustVerifyEmail === void 0 && $$bindings.mustVerifyEmail && mustVerifyEmail !== void 0)
    $$bindings.mustVerifyEmail(mustVerifyEmail);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  return `${$$result.head += `<!-- HEAD_svelte-3wb7bs_START -->${$$result.title = `<title>Profile</title>`, ""}<!-- HEAD_svelte-3wb7bs_END -->`, ""}

<div class="py-12"><div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6"><div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">${validate_component(UpdateProfileInformationForm, "UpdateProfileInformationForm").$$render(
    $$result,
    {
      mustVerifyEmail,
      status,
      classes: "max-w-xl"
    },
    {},
    {}
  )}</div>

        <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">${validate_component(UpdatePasswordForm, "UpdatePasswordForm").$$render($$result, { classes: "max-w-xl" }, {}, {})}</div>

        <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">${validate_component(DeleteUserForm, "DeleteUserForm").$$render($$result, { classes: "max-w-xl" }, {}, {})}</div></div></div>`;
});
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Edit,
  layout: AuthenticatedLayout
}, Symbol.toStringTag, { value: "Module" }));
const Card = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { productImages } = $$props;
  let { productName } = $$props;
  let { productDescription } = $$props;
  let { primaryButtonText } = $$props;
  if ($$props.productImages === void 0 && $$bindings.productImages && productImages !== void 0)
    $$bindings.productImages(productImages);
  if ($$props.productName === void 0 && $$bindings.productName && productName !== void 0)
    $$bindings.productName(productName);
  if ($$props.productDescription === void 0 && $$bindings.productDescription && productDescription !== void 0)
    $$bindings.productDescription(productDescription);
  if ($$props.primaryButtonText === void 0 && $$bindings.primaryButtonText && primaryButtonText !== void 0)
    $$bindings.primaryButtonText(primaryButtonText);
  return `<div class="card lg:card-side bg-base-100 shadow-xl m-6 rounded"><div class="carousel max-w-sm min-w-sm h-72">${each(productImages, (productImage, productImageIndex) => {
    return `<div${add_attribute("id", "" + productImage.product_id + productImageIndex, 0)} class="carousel-item relative w-full mx-1"><img${add_attribute("src", productImage.product_image_url, 0)} class="w-full"${add_attribute("alt", productName, 0)}>
                <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">${productImages.length === 1 ? `` : `${productImageIndex == 0 ? `
                        <a${add_attribute("href", "#" + productImage.product_id + Number(productImages.length - 1), 0)} class="btn btn-circle">❮</a>
                        <a${add_attribute("href", "#" + productImage.product_id + Number(productImageIndex + 1), 0)} class="btn btn-circle">❯</a>` : `${productImageIndex === productImages.length - 1 ? `
                        <a${add_attribute("href", "#" + productImage.product_id + Number(productImageIndex - 1), 0)} class="btn btn-circle">❮</a>
                        <a${add_attribute("href", "#" + productImage.product_id + 0, 0)} class="btn btn-circle">❯</a>` : `
                        <a${add_attribute("href", "#" + productImage.product_id + Number(productImageIndex - 1), 0)} class="btn btn-circle">❮</a>
                        <a${add_attribute("href", "#" + productImage.product_id + Number(productImageIndex + 1), 0)} class="btn btn-circle">❯</a>`}`}`}</div>
            </div>`;
  })}</div>
    <div class="card-body"><h2 class="card-title">${escape(productName)}</h2>
        <p>${escape(productDescription)}</p>
        <div class="card-actions justify-end"><button class="btn btn-primary">${escape(primaryButtonText)}</button></div></div></div>`;
});
const Welcome = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { canLogin, canRegister } = $$props;
  if ($$props.canLogin === void 0 && $$bindings.canLogin && canLogin !== void 0)
    $$bindings.canLogin(canLogin);
  if ($$props.canRegister === void 0 && $$bindings.canRegister && canRegister !== void 0)
    $$bindings.canRegister(canRegister);
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-e8x21g_START -->${$$result.title = `<title>Welcome to Gaaftly</title>`, ""}<!-- HEAD_svelte-e8x21g_END -->`, ""}

<div class="min-h-screen">${each($page.props.products, (product) => {
    return `${validate_component(Card, "Card").$$render(
      $$result,
      {
        productImages: product.images,
        productName: product["name"],
        productDescription: product["description"],
        primaryButtonText: "Buy @" + product["product_store"]
      },
      {},
      {}
    )}`;
  })}</div>`;
});
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Welcome,
  layout: GuestLayout
}, Symbol.toStringTag, { value: "Module" }));
createServer(
  (page2) => createInertiaApp({
    page: page2,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Auth/ConfirmPassword.svelte": __vite_glob_0_0, "./Pages/Auth/ForgotPassword.svelte": __vite_glob_0_1, "./Pages/Auth/Login.svelte": __vite_glob_0_2, "./Pages/Auth/Register.svelte": __vite_glob_0_3, "./Pages/Auth/ResetPassword.svelte": __vite_glob_0_4, "./Pages/Auth/VerifyEmail.svelte": __vite_glob_0_5, "./Pages/Dashboard.svelte": __vite_glob_0_6, "./Pages/Profile/Edit.svelte": __vite_glob_0_7, "./Pages/Profile/Partials/DeleteUserForm.svelte": __vite_glob_0_8, "./Pages/Profile/Partials/UpdatePasswordForm.svelte": __vite_glob_0_9, "./Pages/Profile/Partials/UpdateProfileInformationForm.svelte": __vite_glob_0_10, "./Pages/Welcome.svelte": __vite_glob_0_11 });
      return pages[`./Pages/${name}.svelte`];
    }
  })
);
