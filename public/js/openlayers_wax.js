function wax(json_object) {
    if (json_object.type) {
        new json_object.type(wax(json_object.value));
    }
    else {
        return json_object;
    }
}
