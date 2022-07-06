import {
  h
} from "virtual-dom";
import {
  withPluginApi
} from "discourse/lib/plugin-api";
import {
  wantsNewWindow
} from "discourse/lib/intercept-click";
import DiscourseURL from "discourse/lib/url";

export default {
  name: "discourse-header-dropdown",

  initialize() {
    withPluginApi("0.8.20", (api) => {
      const splitMenuItems = settings.Menu_items;
      const splitSubmenuItems = settings.Submenu_items;
      //const customHeaderLinks = settings.Custom_header_links;
      if (!splitMenuItems.length || !splitSubmenuItems.length) {
        return;
      }

      const linksPosition =
        settings.links_position === "right" ?
        "header-buttons:before" :
        "home-logo:after";

      const menuItemsArray = [];
      const subMenuItemsArray = [];
      const headerLink = [];

      splitSubmenuItems
        .split("|")
        .filter(Boolean)
        .map((customSubLinksArray) => {
          // linkText is the what appear on the menu
          //linkTitle is what appear when hover
          const [parent, subLinkText, subLinkHref, subTarget, subLinkTitle] =
          customSubLinksArray
            .filter(Boolean)
            .map((x) => x.trim());

          const subLinkTarget = subTarget === "self" ? "_self" : "_blank";
          const subLinkClass = `.${subLinkText
            .toLowerCase()
            .replace(/\s/gi, "-")}-header-sub-`;
          const subAnchorAttributes = {
            title: subLinkTitle,
            href: subLinkHref,
          };
          if (subLinkTarget) {
            subAnchorAttributes.target = subLinkTarget;
          }

          const subMenuItem = {
            parent, 
            subLinkClass,
            subAnchorAttributes
          };

          subMenuItemsArray.push(subMenuItem);
        })



      splitMenuItems
        .split("|")
        .filter(Boolean)
        .map((customHeaderLinksArray) => {
          const [linkText, linkTitle, linkHref, device, target] =
          // linkText is the what appear on the menu
          // linkTitle is what appear when hover
          customHeaderLinksArray
            .split(",")
            .filter(Boolean)
            .map((x) => x.trim());

          const deviceClass = `.${device}`;
          const linkTarget = target === "self" ? "" : "_blank";
          const linkClass = `.${linkText
            .toLowerCase()
            .replace(/\s/gi, "-")}-header-main-`;

          const anchorAttributes = {
            title: linkTitle,
            href: linkHref,
          };
          if (linkTarget) {
            anchorAttributes.target = linkTarget;
          }

          const childrenArray = [];
          subMenuItemsArray.forEach((subItem) =>{
            if (subItem.parent === linkText){
              childrenArray.push(subItem);
            }
          })

          const menuItem = {
            deviceClass,
            linkClass,
            linkText, //the text show on menu
            linkTitle, //the text when havor
            linkHref,
            linkTarget,
            children: childrenArray 
          }
          menuItemsArray.push(menuItem);

          

          menuItemsArray.forEach((menuItem) =>{
            headerLink.push(
              h(
                `a.menu-item${menuItem.deviceClass}${linkClass}`,linkText, {
                  title: linkTitle,
                  href: linkHref,
                  target: linkTarget

                },  
                h(`div.d-header-dropdown`,
                  h(`ul.d-dropdown-menu`,
                    children.map((child)=>{
                      return h(`li.submenu-item${child.subLinkClass}`,
                        h(`a.submenu-link`, child.subAnchorAttributes, child.subLinkText))
                    })
                    ))
              )
            )
          })

          headerLink.push()

          

          // headerLinks.push(
          //   h(
          //     `li.headerLink${deviceClass}${linkClass}`,
          //     h("a", anchorAttributes, linkText)
          //   )
          // );
        });



      api.decorateWidget(linksPosition, (helper) => {
        return helper.h("ul.custom-header-links", headerLinks);
      });

      api.decorateWidget("home-logo:after", (helper) => {
        const dHeader = document.querySelector(".d-header");

        if (!dHeader) {
          return;
        }

        const isTitleVisible = helper.attrs.minimized;
        if (isTitleVisible) {
          dHeader.classList.add("hide-menus");
        } else {
          dHeader.classList.remove("hide-menus");
        }
      });

      if (settings.links_position === "left") {
        // if links are aligned left, we need to be able to open in a new tab
        api.reopenWidget("home-logo", {
          click(e) {
            if (e.target.id === "site-logo") {
              if (wantsNewWindow(e)) {
                return false;
              }
              e.preventDefault();

              DiscourseURL.routeToTag($(e.target).closest("a")[0]);

              return false;
            }
          },
        });
      }
    });
  },
};