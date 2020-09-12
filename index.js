/**
 * todo:
 *  1. 可控省市区几级联动
 *  2. 保存取值 --- 省市区 (当市全选时之前选择部分的区域是全部移除仅保留父级市，还是补全区域id为当前市级下所有?)
 *  3. 回显数据
 */

// dialog 默认配置
var defaultConfig = {
    showTitle: false, // 是否展示dialog标题
    title: '这是标题', // dialog标题文案
    showFooter: true, // 是否展示底部按钮
    lockScroll: true, // 是否锁定滚动
    closeOnClickModal: true, // 点击模态框是否可关闭dialog
    showCheckAll: true, // 是否显示全选
    regionData: [] // 区域数据
}
// dialog 配置
var dialogConfig = {}

var dialog = {
    current_area_list: [], // 公用变量 | 当前展开区域数据
    selectedProvinceList: [], // 省
    selectedCityList: [], // 市
    selectedAreaList: [], // 区

    // 展示dialog
    show: function(opt) {
        dialogConfig = $.extend(dialogConfig, defaultConfig, opt || {})
        // console.log('dialogConfig: ', dialogConfig)
        var body = document.body
    
        // 遮罩层
        var mask = document.createElement('div')
        $(mask).attr('id','dialog-mask')
        dialogConfig.closeOnClickModal && $(mask).click(function(){
            // $('#dialog-area').hide().remove()
            // $(this).hide().remove()
            // dialogConfig.lockScroll && $(document.body).css({'overflow': 'visible'})
            dialog.hide()
        })
        dialogConfig.lockScroll && $(body).css({'overflow': 'hidden'})

        // 标题
        if (dialogConfig.showTitle) {
            var titleHtml = '<div class="dialog-title">'+ dialogConfig.title +'</div>'
        }

        var content = document.createElement('div')
        $(content).addClass('dialog-content')
        

        // 全选
        if (dialogConfig.showCheckAll) {
            var ckAllWrap = document.createElement('div')
            var ckAllHtml = '<input class="dialog-check-all" type="checkbox">全选'

            $(ckAllWrap).addClass('check-all-wrap').on('click', '.dialog-check-all', function() {
                // todo 半选？ 存在兼容性问题!
                // $('.p_item_ckbox').prop('indeterminate', !getCKAllStatus('.p_item_ckbox'))
                $('.p_item_ckbox').prop('checked', !getCKAllStatus('.p_item_ckbox'))
                $('.c_item_ckbox').prop('checked', getCKAllStatus('.p_item_ckbox'))
                $('.a_item_ckbox').prop('checked', getCKAllStatus('.p_item_ckbox'))
            }).append(ckAllHtml)
        }
        
        // 弹窗
        var dg = document.createElement('div')
        $(dg).attr('id', 'dialog-area');
        dialogConfig.showTitle && $(dg).append(titleHtml)
        dialogConfig.showCheckAll && $(content).append(ckAllWrap)

        // 省
        p_expand() // 绑定省份icon点击事件
        c_expand() // 绑定城市icon点击事件
        var province = dialog.initProvince()
        $(content).append(province)


        $(dg).append(content)

        // 尾部
        if (dialogConfig.showFooter) {
            var dialogFooter = '<div class="dialog-footer">'+
            '<a href="javascript:;" onClick="dialog.confirm">确定</a>'+
            '<a href="javascript:;" onClick="dialog.hide()">取消</a>'+
            '</div>'
            $(dg).append(dialogFooter)
        }


        $(dg).css({'display':'none'})
        $(dg).show()
    
        $(body).append(dg)
        $(body).append(mask)
    },

    hide: function() {
        $('#dialog-area').hide().remove()
        $('#dialog-mask').hide().remove()
        dialogConfig.lockScroll && $(document.body).css({'overflow': 'visible'})
    },

    // 确定
    confirm: function(){
        console.log('省：', dialog.selectedProvinceList)
        console.log('市：', dialog.selectedCityList)
        console.log('区：', dialog.selectedAreaList)
    },

    // 省
    initProvince: function(){
        var provinceList = dialogConfig.regionData
        var p_wrap = document.createElement('div')
        $(p_wrap).addClass('p_wrap')
        var p_item = ''
        var isEndItem = ''

        for (var index = 0; index < provinceList.length; index++) {
            isEndItem = index %5 == 0 ? 'province_end' : '' // todo 尾插
            p_item += '<div class="p_item ' + isEndItem + '"' +
              'data-province_id="'+ provinceList[index].area_id + '">' +
              '<input class="p_item_ckbox" type="checkbox" onChange="checkedProvince('+ provinceList[index].area_id +')">'+
              '<span>' + provinceList[index].area_name + '</span>' +
              '<i class="icon" onClick="provinceExpand('+ provinceList[index].area_id +')">^</i>'+
            '</div>'
        }

        $(p_wrap).append(p_item)
        // $('.p_item').click(p_expand)
        return p_wrap
    },
    
    // 市
    initCity: function(){},
    
    // 区
    initArea: function(){}
}

// 省展开/收起
function provinceExpand(id){
    var selector = ".p_item[data-province_id='" + id + "']"
    // console.log('当前点击的id: ', id);
    var allData = dialogConfig.regionData || []
    var childCitys = []
    for (var index = 0; index < allData.length; index++) {
        if(allData[index].area_id == id) {
            childCitys = allData[index].urban
            break
        }
    }
    // console.log('城市数组为： ', childCitys);

    // var curr_province = $(".p_item[data-province_id='" + id + "']")
    
    var c_item = ''

    for (var idx = 0; idx < childCitys.length; idx++) {
        // console.log('childCitys: ', childCitys[idx]);

        if(childCitys[idx].final && childCitys[idx].final.length) {
            c_item += '<div class="c_item" '+
            'data-city_id="'+ childCitys[idx].area_id + '">' +
            '<input class="c_item_ckbox" type="checkbox" onChange="checkedCity('+ childCitys[idx].area_id +')">'+
            '<span>' + childCitys[idx].area_name + '</span>' +
            '<i class="icon" onClick="cityExpand('+ childCitys[idx].area_id +')">^</i>'+
            '</div>'
        } else {
            c_item += '<div class="c_item">'+
             '<span>' + childCitys[idx].area_name + '</span>' +
             '</div>'
        }
    }
    // console.log('c_item: ', c_item);

    // 延迟添加子集 城市
    setTimeout(function(){
        $(selector).find('.province_expand').append(c_item)
        // 若当前省份为选择状态，则子集中的 城市 皆选中     todo 数据回显+半选
        $(selector).find('.province_expand .c_item_ckbox').prop('checked', $(selector).find('.p_item_ckbox').prop('checked'))
    })




    // $(".p_item[data-province_id='" + id + "']").click()
    // $(".p_item[data-province_id='" + id + "']").on('click', 'i.icon', function(event){

    //     if($(this).find('i.icon').hasClass('active')){
    //         $(this).removeClass('active').parent('.p_item').removeClass('active').find('.province_expand').remove()
    //     } else {
    //         var province_expand = '<div class="province_expand"><a href="javascript:;" class="province_close">关闭</a></div>'
    //         $(this).addClass('active').parent('.p_item').addClass('active').append(province_expand)
    //         $(this).siblings('.province_expand').on('click', '.province_close', function(){
    //             $(this).parent('.province_expand').hide().siblings('i.icon').removeClass('active').parent('.p_item').removeClass('active').find('.province_expand').remove()
    //         })
    //     }
    // })
}

// 省份点击事件
function p_expand() {
    $(document.body).on('click', '.p_item > i.icon', function(event){

        if($(this).hasClass('active')){
            // 当前省份已展开
            $(this).removeClass('active').parent('.p_item').removeClass('active').find('.province_expand').remove()
        } else {
            // 未展开, 收起页面中其它展开项
            $('.p_item > i.icon').removeClass('active').parent('.p_item').removeClass('active').find('.province_expand').remove()

            // console.log("$(this).parent('.p_item')[0].offsetLeft", $(this).parent('.p_item')[0].offsetLeft);
            // console.log("document.body.offsetWidth: ", document.body.offsetWidth);

            // 计算城市区域展开位置
            var city_area_position = ''
            if ($(this).parent('.p_item')[0].offsetLeft > document.body.offsetWidth / 2) {
                city_area_position = 'style="right:0;"'
            } else {
                city_area_position = 'style="left:0;"'
            }


            var province_expand = '<div class="province_expand"'+ city_area_position +'><a href="javascript:;" class="province_close">关闭</a></div>'
            $(this).addClass('active').parent('.p_item').addClass('active').append(province_expand)
            $(this).siblings('.province_expand').on('click', '.province_close', function(){
                $(this).parent('.province_expand').siblings('i.icon').removeClass('active').parent('.p_item').removeClass('active').find('.province_expand').remove()
                $(this).parent('.province_expand').remove()
            })
        }
    })
}

// 市展开/收起
function cityExpand(id){
    var selector = ".c_item[data-city_id='" + id + "']"
    dialog.current_area_list = []
    findAreaById(dialogConfig.regionData, id)
    console.log('cao ni m: ', dialog.current_area_list);
    var area_list = dialog.current_area_list
    console.log('市展开', id, area_list);

    var a_item = ''

    for (var idx = 0; idx < area_list.length; idx++) {
        // console.log('area_list: ', area_list[idx]);

        a_item += '<div class="a_item" '+
            'data-area_id="'+ area_list[idx].area_id + '">' +
            '<input class="a_item_ckbox" type="checkbox" onChange="checkedArea('+ area_list[idx].area_id +')">'+
            '<span>' + area_list[idx].area_name + '</span>' +
            '</div>'
    }

    // 延迟添加子集 区域
    setTimeout(function(){
        $(selector).find('.city_expand').append(a_item)
        // 若当前城市为选择状态，则子集中的 区域 皆选中     todo 数据回显+半选
        $(selector).find('.city_expand .a_item_ckbox').prop('checked', $(selector).find('.c_item_ckbox').prop('checked'))
    })
}

// 城市点击事件
function c_expand(){
    $(document.body).on('click', '.c_item > i.icon', function(event){
        if($(this).hasClass('active')){
            // 当前省份已展开
            $(this).removeClass('active').parent('.c_item').removeClass('active').find('.city_expand').remove()
        } else {
            // 未展开, 收起页面中其它展开项
            $('.c_item > i.icon').removeClass('active').parent('.c_item').removeClass('active').find('.city_expand').remove()

            // console.log("$(this).parent('.c_item')[0].offsetLeft", $(this).parent('.c_item')[0].offsetLeft);
            // console.log("document.body.offsetWidth: ", document.body.offsetWidth);

            // 计算城市区域展开位置
            var city_area_position = ''
            if ($(this).parent('.c_item')[0].offsetLeft > document.body.offsetWidth / 2) {
                city_area_position = 'style="right:0;"'
            } else {
                city_area_position = 'style="left:0;"'
            }


            var city_expand = '<div class="city_expand"'+ city_area_position +'><a href="javascript:;" class="city_close">关闭</a></div>'
            $(this).addClass('active').parent('.c_item').addClass('active').append(city_expand)
            $(this).siblings('.city_expand').on('click', '.city_close', function(){
                $(this).parent('.city_expand').siblings('i.icon').removeClass('active').parent('.c_item').removeClass('active').find('.city_expand').remove()
                $(this).parent('.city_expand').remove()
            })
        }
    })
}

// 根据id查找区域数据
function findAreaById(list, id, prop, child){
    if(dialog.current_area_list.length) return

    prop = prop || 'area_id'
    child = child || 'urban'

    for (var index = 0; index < list.length; index++) {
        if(dialog.current_area_list.length) return

        if(list[index][prop] == id) {
            dialog.current_area_list = list[index].final
            return list[index]
        }
        
        if(list[index][child] instanceof Array && list[index][child].length) {
            findAreaById(list[index][child], id, prop, 'final')
        }
    }
}

// 获取全选按钮状态
function getCKAllStatus(selector){
    var condition = true
    $(selector).each(function(i,el){
        if(!$(el).prop('checked')){
            condition = false
            return false
        }
    })
    return condition
}

// 选中省份
function checkedProvince(id) {
    var selector = ".p_item[data-province_id='" + id + "']"

    // todo 查找方法待优化
    var allData = dialogConfig.regionData || []
    var childCitys = []
    for (var index = 0; index < allData.length; index++) {
        if(allData[index].area_id == id) {
            childCitys = allData[index].urban
            break
        }
    }
    console.log('Current selected province: ', id, $(selector).find('.p_item_ckbox').prop('checked'), childCitys);

    // 监测 省份 是否全选
    $('.dialog-check-all').prop('checked', getCKAllStatus('.p_item_ckbox'))

    // 若当前省份已展开，则联动展开区域中的 城市
    if($(selector).hasClass('active')){
        console.log('Province has already expand!', $(selector).find('.p_item_ckbox').prop('checked'));
        $(selector).find('.province_expand .c_item_ckbox').prop('checked', $(selector + '.active').find('.p_item_ckbox').prop('checked'))
        $(selector).find('.province_expand .a_item_ckbox').prop('checked', $(selector).find('.c_item.active .c_item_ckbox').prop('checked'))
    }
}

// 选中城市
function checkedCity(id) {
    var selector = ".c_item[data-city_id='" + id + "']"
    dialog.current_area_list = []
    findAreaById(dialogConfig.regionData, id)
    console.log('Current selected city: ', id, $(selector).find('.c_item_ckbox').prop('checked'), dialog.current_area_list);


    // 监测当前展开 省份 中的 城市 是否全选
    $(selector).parent('.province_expand').siblings('.p_item_ckbox').prop('checked', getCKAllStatus(selector + ' .c_item_ckbox'))

    // 若当前城市已展开，则联动展开区域中的 区域
    if($(selector).hasClass('active')){
        console.log('City has already expand!', $(selector).find('.c_item_ckbox').prop('checked'));
        $(selector).find('.city_expand .a_item_ckbox').prop('checked', $(selector).find('.c_item_ckbox').prop('checked'))
    }
}

// 选中区域
function checkedArea(id) {
    var selector = ".a_item[data-area_id='" + id + "']"

    console.log('Current selected area: ', id, $(selector).find('.a_item_ckbox').prop('checked'));

    // 监测当前展开 城市 中的 区域 是否全选
    var c_item_id = $(selector).parents('.c_item').attr('data-city_id')
    $(selector).parent('.city_expand').siblings('.c_item_ckbox').prop('checked', getCKAllStatus(".c_item[data-city_id='" + c_item_id + "']" + ' .a_item_ckbox'))

    // 监测当前展开 省份 中的 城市 是否全选
    var p_item_id = $(selector).parents('.p_item').attr('data-province_id')
    $(selector).parents('.province_expand').siblings('.p_item_ckbox').prop('checked', getCKAllStatus(".p_item[data-province_id='" + p_item_id + "']" + ' .c_item_ckbox'))
}

$.dialog = dialog.show