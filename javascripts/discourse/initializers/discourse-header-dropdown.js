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

      const {
          iconNode
        } = require("discourse-common/lib/icon-library");

        const subMenuItemsArray = [];
        const headerLinks = [];
        const subCategories = [];
      
      const splitMenuItems = settings.Menu_items;
     
      const splitSubmenuItems = settings.Submenu_items;

      const muteCategory = settings.Category_to_be_mute;


      

      const categoryLinks = api.container.lookup("service:site").categories;
      const currentUser = api.container.lookup("current-user:main");
      //console.log("categoryLinks", categoryLinks);
    
      if (!splitMenuItems.length || !splitSubmenuItems.length) {
        return;
      }

      categoryLinks.forEach(category => {
        if(!category.hasMuted || (currentUser && currentUser.admin)){
          if(category.parentCategory){
            const parentUrl = `${category.parentCategory.slug}/`;
            subCategories.push({
              parent:category.parentCategory.name,
              subLinkClass: `.${category.name.toLowerCase().replace(/\s/gi, "-")}`,
                    subLinkText: category.name,
                    subCategories:[],
                    subAnchorAttributes: {
                      title:category.name,
                      target: "_self",
                      href: `/c/${parentUrl}${category.slug}/${category.id}`,
                      className:category.slug}

            })
          } else {
            subMenuItemsArray.push(
              {
                parent: "Discussions",
                  subLinkClass: `.${category.name.toLowerCase().replace(/\s/gi, "-")}`,
                        subLinkText: category.name,
                        subCategories:[],
                        subAnchorAttributes: {
                          title:category.name,
                          target: "_self",
                          href: `/c/${category.slug}/${category.id}`,
                          className: category.slug}
              }
          )

            }
         }})

         subMenuItemsArray.forEach((item) => {
          for (let i = 0; i < subCategories.length; i++) {
            if(subCategories[i].parent === item.subLinkText){
              item.subCategories.push(subCategories[i]);
              //item.subLinkClass = ".hasChildren";
            }
          }
         })
         //console.log("subMebueItemArray, ", subMenuItemsArray);
         //console.log("subCategories", subCategories);

      
     
    

      splitSubmenuItems
        .split("|")
        .filter(Boolean)
        .map((customSubLinksArray) => {
          const [parent, subLinkText, subLinkHref, subTarget, subLinkTitle] =
          customSubLinksArray
            .split(",")
            .filter(Boolean)
            .map((x) => x.trim());

          const subLinkTarget = subTarget === "self" ? "" : "_blank";
          //const subLinkTarget = "_blank";
          const subLinkClass = `.${subLinkText
            .toLowerCase()
            .replace(/\s/gi, "-")}`;
          const subAnchorAttributes = {
            title: subLinkTitle,
            href: subLinkHref,
          };
          if (subLinkTarget) {
            subAnchorAttributes.target = subLinkTarget;
          }
          //console.log(subAnchorAttributes.target);

          const subMenuItem = {
            parent,
            subLinkClass,
            subLinkText,
            subAnchorAttributes,
            subCategories: []
          };

          subMenuItemsArray.push(subMenuItem);
        })




     splitMenuItems
        .split("|")
        .filter(Boolean)
        .map((customHeaderLinksArray) => {
          const [linkText, linkTitle, linkHref, target] =
          // linkText is the what appear on the menu
          // linkTitle is what appear when hover
          customHeaderLinksArray
            .split(",")
            .filter(Boolean)
            .map((x) => x.trim());

          const linkTarget = target === "self" ? "" : "_blank";
          const linkClass = `.${linkText
            .toLowerCase()
            .replace(/\s/gi, "-")}`;


          const childrenArray = [];
         
          subMenuItemsArray.forEach((subItem) => {
             
      
            if(subItem.parent === linkText) {
              if((currentUser && currentUser.admin) ||(subItem.subAnchorAttributes.title !== "Uncategorized" 
              && subItem.subAnchorAttributes.title !== `${muteCategory}`)){
                childrenArray.push(subItem);
              }
              
             
            }
          })

          const menuItem = {
            linkClass,
            linkText, //the text show on menu
            linkTitle, //the text when havor
            linkHref,
            linkTarget,
            children: childrenArray
          }
        
          let icon = iconNode('caret-right');
        

          headerLinks.push(
            h('div.menu-item-wrapper',{tabIndex:"0"}, [h(
              `a.menu-item${menuItem.linkClass}`, {
                title: menuItem.linkTitle,
                href: menuItem.linkHref,
                target: menuItem.linkTarget
              }, [menuItem.linkText,
              h(`div.d-header-dropdown`,
                h(`ul.d-dropdown-menu`,
                  menuItem.children.map((child) => {
                    if((!child.subCategories) || (child.subCategories && child.subCategories.length === 0)){
                      return h(`li.submenu-item${child.subLinkClass}`,
                      h("a.submenu-link", child.subAnchorAttributes, child.subLinkText))
                    }
                    
                    else {
                    

                      
                      return h(`li.submenu-item${child.subLinkClass}.hasChildren`, [
                      h(`a.submenu-link`, child.subAnchorAttributes,[
                        child.subLinkText, h('div.d-header-dropdown.innermost-dropdown', 
                        h(`ul.d-dropdown-submenu`,child.subCategories.map( (category) => {
                          return h(`li.innermost-menu-item${category.subLinkClass}`,
                        h("a.innermost-menu-link", category.subAnchorAttributes, category.subLinkText))
                        })
                        
                        ))
                      ]), icon],
                      )
                    }  
                  })
                ))]
            ), icon]
            )
          )  
        });

        const htmlArray= [];
        htmlArray.push(
           
            h('label.nav__toggle-label',{
              htmlFor: "nav__toggle"
              }, 
                h('span.hamburger-menu'))
        )
        let subscribeLink;
       if(api.getCurrentUser() && !api.getCurrentUser().groups.any(g => g.name === "Member_Directory")){
        subscribeLink = h("a.subscribe-for-member", {title: "Subscribe", href:  "/s"}, "Subscribe");
        //console.log("subscribeLink", subscribeLink);
       } else {
          subscribeLink = "";
       }
       htmlArray.push(subscribeLink);
  
        api.decorateWidget("header-buttons:before", (helper) => {
          return helper.h("div.some-wrapper", htmlArray);
          
        });

    


      api.decorateWidget("home-logo:after",(helper) => {
        return helper.
        h('div.menu-content wrap',
          h('div.menu-placeholder',
            h('div.menu-item-container')))
      });
     

      api.decorateWidget("home-logo:after", (helper) => {
       
        
        return helper.h("div.menu-items", headerLinks);
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

    

      api.onPageChange(() => {
        const burgerMenuIcon = document.querySelector('.nav__toggle-label');
        const menuItems = document.querySelector('.menu-items');
        let isOpen = false;
        let styleEle = document.head.appendChild(document.createElement("style"));
        burgerMenuIcon.addEventListener('click', e => {
          const hamburgerCore = burgerMenuIcon.querySelector('.hamburger-menu');
          if (!isOpen) {
            styleEle.innerHTML = ".nav__toggle-label span::before{transform: translateX(10px) rotate(20deg);background-color: var(--primary);}";
            burgerMenuIcon.classList.add("nav__toggle-label--active");
            menuItems.classList.add("menu-items-open");
            isOpen = true;
          } else {
            styleEle.innerHTML = "";
            burgerMenuIcon.classList.remove("nav__toggle-label--active");
            menuItems.classList.remove("menu-items-open");
            isOpen = false;
          }
        });

        window.addEventListener("resize", () => {
          if (window.screen.width >= 851 && isOpen) {
            menuItems.classList.remove("menu-items-open");
            styleEle.innerHTML = "";
            burgerMenuIcon.classList.remove("nav__toggle-label--active");
            isOpen = false;
          }
        })

        document.addEventListener("scroll", (e) => {
          if (isOpen) {
          menuItems.classList.remove("menu-items-open");
            styleEle.innerHTML = "";
            burgerMenuIcon.classList.remove("nav__toggle-label--active");
            isOpen = false;
          }
        })
      })

    });
  },
};